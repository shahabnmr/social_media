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

it('return 400, bad request, email not find! pls check email.', async () => {
	await request(app)
		.post('/api/v1/auth/forget-password')
		.send({
			email: 'wrongEmail@test.com',
		})
		.expect(400);
});

it('successfully get token for reset-password', async () => {
	await signin();
	const res = await request(app).post('/api/v1/auth/forget-password').send({ email }).expect(200);

	expect(res.body.token_).toBeDefined();
});
