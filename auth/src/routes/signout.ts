import express, { Request, Response } from 'express';

import { UserService } from '../services/db/psql/user';
import { decode } from '../../middlewares/crypt';
import { BadRequestError, currentUser } from '@sn_common/common';
import { natsWrapper } from '../nats-wrapper';
import { SignOutPublisher } from '../events/publisher/signout';

const router = express.Router();

router.post('/api/v1/auth/signout', currentUser, async (req: Request, res: Response) => {
	if (!req.session?.details) throw new BadRequestError('details must be provided');

	const userService = await UserService.getInstance();
	const { details } = req.session;
	const { currentUser } = req;

	if (!currentUser) throw new BadRequestError('you are Not signedIn');

	const user = await userService.findOne(currentUser!.email, '', '');
	if (!user) throw new BadRequestError('user not found!');

	const decoded = JSON.parse(await decode(details));
	await userService.updateOtp(decoded.otp_id, false);
	req.session = null;

	const version = await userService.updateVersionUser(currentUser.id);

	new SignOutPublisher(natsWrapper.client).publish({
		email: currentUser!.email,
		version,
	});

	res.send({ message: 'signed out' });
});

export { router as signOutRouter };
