import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, currentUser, validateRequest } from '@sn_common/common';

import { UserService } from '../services/db/psql/user';
import { UpdateRollPublisher } from '../events/publisher/update-roll';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
router.put(
	'/api/v1/auth/update/roll/',
	[
		body('roll').isIn(['user', 'admin']).withMessage('roll must be user or admin'),
		body('email').isEmail().withMessage('email not valid'),
	],
	validateRequest,
	currentUser,
	async (req: Request, res: Response) => {
		const { email, roll } = req.body;
		const userService = await UserService.getInstance();

		if (!req.currentUser) throw new BadRequestError('you must signIn firstly');
		const userId = req.currentUser.id;

		const user = await userService.findOne('', '', userId);
		const user2 = await userService.findOne(email, '', '');

		if (!user2) throw new BadRequestError('email not found.');

		if (!user) throw new BadRequestError('user Not found');
		if (user.roll !== 'admin') throw new BadRequestError('you must be admin for this feature');

		const result = await userService.updateRoll(email, roll);
		const version = await userService.updateVersionUser(email);

		await new UpdateRollPublisher(natsWrapper.client).publish({
			email,
			roll,
			version,
		});

		res.status(201).send({ message: result });
	},
);

export { router as updateRollRouter };
