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

it('response with details about the current user', async () => {
	const { cookie } = await signin();

	const response = await request(app)
		.get('/api/v1/auth/currentuser')
		.set('Cookie', cookie)
		.send()
		.expect(200);

	expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
	const response = await request(app).get('/api/v1/auth/currentuser').send().expect(200);

	expect(response.body.currentUser).toEqual(null);
});
