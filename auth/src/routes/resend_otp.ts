import express, { Request, Response } from 'express';
import { BadRequestError } from '@sn_common/common';

import { UserService } from '../services/db/psql/user';
import { otpGenerate } from '../services/otp/otp';
import { encode } from '../../middlewares/crypt';
import { decode } from '../../middlewares/crypt';
import { EmailOtpPublisher } from '../events/publisher/email-otp';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/v1/auth/resendotp', async (req: Request, res: Response) => {
	if (!req.session?.details) {
		throw new BadRequestError('first Signin');
	}

	const decoded = JSON.parse(await decode(req.session.details));

	const userId = decoded.userId;

	const userService = await UserService.getInstance();

	const lastOtp = await userService.findOneOtp('', decoded.userId);

	if (new Date(lastOtp.expiration_time) > new Date())
		throw new BadRequestError('last otp have expiration time');

	const existingUser = await userService.findOne('', '', userId);

	if (!existingUser) throw new BadRequestError('Not found user');

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

	req.session = { details: encoded };

	new EmailOtpPublisher(natsWrapper.client).publish({
		email: existingUser.email,
		name: existingUser.name,
		family: existingUser.family,
		otp,
	});

	res.status(200).send({ user: existingUser.id });
});

export { router as resendOtp };
