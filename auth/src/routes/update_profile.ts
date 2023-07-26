import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@sn_common/common';

import { UserService } from '../services/db/psql/user';

const router = express.Router();

router.put(
	'/api/v1/auth/profile',
	requireAuth,
	[
		body('name')
			.isString()
			.isLength({ min: 3, max: 15 })
			.withMessage('name must be between 3 and 15'),
		body('family')
			.isString()
			.isLength({ min: 3, max: 20 })
			.withMessage('family must be between 3 and 15'),
		body('tell').isInt().isLength({ min: 11, max: 11 }).withMessage('tell is invalid'),
		body('email').isEmail().withMessage('email must be valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const userService = await UserService.getInstance();
		const { email, tell, name, family } = req.body;

		const userId = req.currentUser!.id;
		const user = await userService.findOne('', '', userId);

		if (!user) throw new BadRequestError('user Not found');

		await userService.updateUser(userId, name, family, tell, email);

		res.status(200).send({
			message: 'updated',
		});
	},
);

export { router as updateProfileRouter };
