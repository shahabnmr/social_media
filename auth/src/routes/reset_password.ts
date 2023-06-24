import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { UserService } from '../services/db/psql/user';
import sanitizedConfig from '../config';

const router = express.Router();

router.post(
	'/api/v1/auth/reset-password/:token_',
	[
		body('password')
			.trim()
			.isLength({ min: 6, max: 20 })
			.withMessage('password must be between 6 and  20'),
		body('confirmPassword')
			.trim()
			.isLength({ min: 6, max: 20 })
			.withMessage('confirmpassword must be between 6 and  20'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const userService = await UserService.getInstance();

		const { token_ } = req.params;

		const { password, confirmPassword } = req.body;

		const decodedToken = jwt.verify(token_, sanitizedConfig.JWT_KEY);

		if (!decodedToken)
			throw new BadRequestError('you have not permission for this action');

		//@ts-ignore
		const user = await userService.findOne('', '', decodedToken.userId);
		if (!user) throw new BadRequestError('user not found');

		if (password !== confirmPassword)
			throw new BadRequestError('password not equal with confirm password, pls check it');

		await userService.resetPassword(user.id, password);

		res.status(200).send({ message: 'password updated' });
	},
);

export { router as resetPasswordRouter };
