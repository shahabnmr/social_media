import express, { Request, Response } from 'express';

import { UserService } from '../services/db/psql/user';
import { decode } from '../../middlewares/crypt';
import { BadRequestError } from '@sn_common/common';

const router = express.Router();

router.post('/api/v1/auth/signout', async (req: Request, res: Response) => {
	if (!req.session?.details) throw new BadRequestError('details must be provided');

	const { details } = req.session;

	const userService = await UserService.getInstance();

	const decoded = JSON.parse(await decode(details));
	await userService.updateOtp(decoded.otp_id, false);
	req.session = null;

	res.send({});
});

export { router as signOutRouter };
