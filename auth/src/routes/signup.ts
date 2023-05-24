import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { UserService } from '../services/db/psql/user';
import { otpGenerate } from '../services/otp/otp';
import { encode } from '../../middlewares/crypt';

const router = express.Router();

router.post(
	'/api/v1/auth/signup',
	[
		body('name').isString().isLength({ min: 3, max: 15 }),
		body('family').isString().isLength({ min: 3, max: 20 }),
		body('tell').isString().isLength({ min: 11, max: 11 }),
		body('email').isEmail().withMessage('email must be valid'),
		body('password').trim().isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20'),
		body('confirmPassword').trim().isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { name, family, email, tell, password, confirmPassword } = req.body;

		const userService = await UserService.getInstance();
		const user = await userService.findOne(email, tell, '');

		if (user) throw new BadRequestError('email or tell in use');

		if (password !== confirmPassword) throw new BadRequestError('field password not equal with confirm password');

		const userSignedUp = await userService.insertUser(name, family, tell, email, password);

		const { otp, expirationTime, now } = otpGenerate();

		const instanceOtp_id = await userService.createOtp(otp, expirationTime, userSignedUp!);

		const details = {
			timestamp: now,
			message: 'OTP sent to user',
			otp_id: instanceOtp_id,
			userId: userSignedUp,
		};

		const encoded = await encode(JSON.stringify(details));

		// send otp with email to user in nats by email service

		req.session = { details: encoded };

		res.status(201).send({ user: userSignedUp });
	},
);

export { router as signupRouter };
