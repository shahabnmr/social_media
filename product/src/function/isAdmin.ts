import { UserService } from '../services/db/psql/user';
import { BadRequestError } from '@sn_common/common';

export const isAdmin = async (email: string) => {
	const userService = await UserService.getInstance();
	const admin = await userService.isAdmin(email);
	if (!admin) throw new BadRequestError('for this feature you must have roll admin');
	return true;
};
