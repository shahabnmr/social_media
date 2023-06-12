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

it('return 201 on successful signup', async () => {
	return request(app)
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
});

it('return 400 on email or tell in use', async () => {
	await request(app).post('/api/v1/auth/signup').send({
		name: 'shahab',
		family: 'asd',
		tell: '01234567890',
		email,
		password: '123qwe',
		confirmPassword: '123qwe',
	});

	await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567890',
			email,
			password: '123qwe',
			confirmPassword: '123qwe',
		})
		.expect(400);
});

it('return 400 field password not equal with confirm password', async () => {
	return await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567890',
			email,
			password: '123qwe',
			confirmPassword: 'not equal pass',
		})
		.expect(400);
});

it('returns a 400 with an invalid email', async () => {
	return await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567890',
			email: 'asddasds',
			password: '123qwe',
			confirmPassword: '123qwe',
		})
		.expect(400);
});

it('returns a 400 with an invalid password', async () => {
	return await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567890',
			email: 'asddasds',
			password: '1',
			confirmPassword: '1',
		})
		.expect(400);
});

it('set cookie details after signup', async () => {
	const res = await request(app)
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
	expect(res.get('Set-Cookie')).toBeDefined();
});

it('emit event email otb', async () => {
	const res = await request(app)
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

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
