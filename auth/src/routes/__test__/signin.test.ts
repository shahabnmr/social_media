import request from 'supertest';
import { app } from '../../app';
import { UserService } from '../../services/db/psql/user';
import { natsWrapper } from '../../nats-wrapper';

let userService;
const email = 'asdadal@gmail.com';

afterEach(async () => {
	userService = await UserService.getInstance();
	const user = await userService.findOne(email, '', '');

	if (user) {
		const otp = await userService.findOneOtp('', user.id);
		await userService.deleteOtp(otp.id);
		await userService.deleteUser(email);
	}
});

it('fails when email does not exist supplied', async () => {
	await request(app)
		.post('/api/v1/auth/signin')
		.send({ email: 'asdasd@gmail.com', password: 'asde4' })
		.expect(400);
});

it('fails when password is wrong', async () => {
	await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567891',
			email,
			password: '123qwe',
			confirmPassword: '123qwe',
		})
		.expect(201);

	await request(app)
		.post('/api/v1/auth/signin')
		.send({ email, password: 'wrong pass' })
		.expect(400);
});

it('response with a cookie when given valid credential', async () => {
	await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567891',
			email,
			password: '123qwe',
			confirmPassword: '123qwe',
		})
		.expect(201);

	const response = await request(app)
		.post('/api/v1/auth/signin')
		.send({ email, password: '123qwe' })
		.expect(200);

	expect(response.get('Set-Cookie')).toBeDefined();
});

it('emit email otp', async () => {
	await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567891',
			email,
			password: '123qwe',
			confirmPassword: '123qwe',
		})
		.expect(201);

	const response = await request(app)
		.post('/api/v1/auth/signin')
		.send({ email, password: '123qwe' })
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
