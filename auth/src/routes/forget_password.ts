import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { UserService } from '../services/db/psql/user';
import sanitizedConfig from '../config';
import { natsWrapper } from '../nats-wrapper';
import { ForgetPasswordPublisher } from '../events/publisher/forger-password';

const router = express.Router();

router.post(
	'/api/v1/auth/forget-password',
	[body('email').isEmail().withMessage('email not valid')],
	validateRequest,
	async (req: Request, res: Response) => {
		const userService = await UserService.getInstance();

		const { email } = req.body;

		const user = await userService.findOne(email, '', '');

		if (!user) throw new BadRequestError('email not find! pls check email.');

		const token = jwt.sign({ userId: user.id }, sanitizedConfig.JWT_KEY, { expiresIn: '1h' });

		const resetLink = `http://localhost:3000/api/v1/auth/reset-password/${token}`;

		// send email with service that link
		new ForgetPasswordPublisher(natsWrapper.client).publish({
			email,
			name: user.name,
			family: user.family,
			link: resetLink,
		});

		res.status(200).send({ token_: token });
	},
);

export { router as forgetPasswordRouter };
