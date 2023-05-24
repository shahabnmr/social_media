import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@sn_common/common';

import { Password } from '../services/password/password';
import { UserService } from '../services/db/psql/user';
import { otpGenerate } from '../services/otp/otp';
import { encode } from '../../middlewares/crypt';

const router = express.Router();

router.post(
	'/api/v1/auth/signin',
	[
		body('email').isEmail().withMessage('Email is invalid'),
		body('password').trim().notEmpty().withMessage('you must Enter password'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		if (req.session?.details) {
			throw new BadRequestError('you are signed in!');
		}
		const { email, password } = req.body;

		const userService = await UserService.getInstance();
		const existingUser = await userService.findOne(email, '', '');

		if (!existingUser) throw new BadRequestError('invalid credentials');

		const machPassword = await Password.compare(existingUser.password, password);

		if (!machPassword) throw new BadRequestError('invalid Credentials');

		const { otp, expirationTime, now } = otpGenerate();

		await userService.deleteOtpUnused(existingUser.id);

		const instanceOtp_id = await userService.createOtp(otp, expirationTime, existingUser.id);

		const details = {
			timestamp: now,
			message: 'OTP sent to user',
			otp_id: instanceOtp_id,
			userId: existingUser.id,
		};

		const encoded = await encode(JSON.stringify(details));

		// send otp with email to user in nats by email service

		req.session = { details: encoded };

		res.status(200).send({ user: existingUser.id });
	},
);

export { router as signinRouter };
