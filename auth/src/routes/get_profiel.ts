import express, { Request, Response } from 'express';
import { BadRequestError, currentUser } from '@sn_common/common';

import { UserService } from '../services/db/psql/user';

const router = express.Router();

router.get('/api/v1/auth/profile', currentUser, async (req: Request, res: Response) => {
	const userService = await UserService.getInstance();
	const userId = req.currentUser!.id;

	const user = await userService.findOne('', '', userId);

	if (!user) throw new BadRequestError('user Not found');

	res.status(200).send({
		user: {
			email: user.email,
			tell: user.tell,
			name: user.name,
			family: user.family,
		},
	});
});

export { router as getProfileRouter };
