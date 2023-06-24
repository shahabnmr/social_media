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

it('return 400, you must signed in', async () => {
	await request(app).get('/api/v1/auth/profile').send().expect(400);
});

it('get 200, get profile successful', async () => {
	const { cookie } = await signin();
	const res = await request(app)
		.get('/api/v1/auth/profile')
		.set('Cookie', cookie)
		.send()
		.expect(200);

	expect(res.body.user.email).toEqual('test@test.com');
	expect(res.body.user.tell).toEqual('01234567891');
});
