import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';
import { UserService } from '../../services/db/psql/user';

let userService;
const email = 'test@test.com';
afterEach(async () => {
	userService = await UserService.getInstance();
	const user = await userService.findOne(email, '', '');

	if (user) {
		const otp = await userService.findOneOtp('', user.id);
		otp ? await userService.deleteOtp(otp.id) : '';
		await userService.deleteUser(email);
	}
});

it('details must be provided', async () => {
	await request(app).post('/api/v1/auth/signout').send().expect(400);
});

it('you are Not signedIn', async () => {
	const { details } = await signin();
	await request(app).post('/api/v1/auth/signout').set('Cookie', details).send().expect(400);
});

it('successful signout', async () => {
	const { cookie } = await signin();
	await request(app).post('/api/v1/auth/signout').set('Cookie', cookie).send().expect(200);
});
