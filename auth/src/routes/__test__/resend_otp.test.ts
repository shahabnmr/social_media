import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';
import { UserService } from '../../services/db/psql/user';

let userService;
const email = 'test@test.com';
beforeEach(() => {
	jest.spyOn(global, 'Date').mockImplementationOnce(() => new Date('2021-09-12T11:01:58.135Z'));
});

afterEach(async () => {
	userService = await UserService.getInstance();
	const user = await userService.findOne(email, '', '');

	if (user) {
		const otp = await userService.findOneOtp('', user.id);
		otp ? await userService.deleteOtp(otp.id) : '';
		await userService.deleteUser(email);
	}
});

it('return 400, first signin', async () => {
	await request(app).post('/api/v1/auth/resendotp').send().expect(400);
});

it('return 400, last otp have expiration time', async () => {
	const { cookie } = await signin();
	await request(app).post('/api/v1/auth/resendotp').set('Cookie', cookie).send().expect(400);
});

it('return 200,we have to wait 10 minutes ,and resend otp', async () => {
	const { cookie } = await signin();

	await request(app).post('/api/v1/auth/resendotp').set('Cookie', cookie).send().expect(200);
});
