import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { decode } from '../../middlewares/crypt';
import { BadRequestError } from '@sn_common/common';
import { UserService } from '../services/db/psql/user';
import sanitizedConfig from '../config';
import { dates } from '../services/dates/dates';

const router = express.Router();

router.post('/api/v1/auth/verify/', async (req: Request, res: Response) => {
	const userService = await UserService.getInstance();
	const { otp } = req.body;

	if (!req.session?.details) {
		throw new BadRequestError('details must be provided');
	}

	const { details } = req.session;

	if (!details) throw new BadRequestError('bad request');
	const decoded = JSON.parse(await decode(details));

	const otp_instance = await userService.findOneOtp(decoded.otp_id);

	if (otp_instance != null) {
		if (otp_instance.active != true) {
			if (dates.compare(otp_instance.expiration_time, `${new Date()}`) == 1) {
				if (otp_instance.otp === otp) {
					await userService.updateOtp(otp_instance.id, true);
					const user = await userService.findOne('', '', decoded.userId);

					const userJwt = jwt.sign(
						{
							id: user.id,
							email: user.email,
							tell: user.tell,
						},
						sanitizedConfig.JWT_KEY,
					);

					Object.assign(req.session, { jwt: userJwt });

					res.status(200).send({ user: user.id });
				} else {
					throw new BadRequestError('OTP not mached');
				}
			} else {
				throw new BadRequestError('OTP expired');
			}
		} else {
			throw new BadRequestError('OTP already used');
		}
	} else {
		throw new BadRequestError('OTP not exist');
	}
});

export { router as verifyUserRouter };
