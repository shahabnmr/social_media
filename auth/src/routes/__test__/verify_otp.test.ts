import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { signin } from '../../test/setup';
import otpGenerate from 'otp-generator';

const email = 'asdadal@gmail.com';

describe('verify otp', () => {
	it('verify otp and get 200 status code and get userId', async () => {
		const spyOtp = jest.spyOn(otpGenerate, 'generate').mockReturnValue('asd123');

		const signup = await request(app)
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

		const cookie = signup.get('Set-Cookie');

		const result = await request(app)
			.post('/api/v1/auth/verify/')
			.set('Cookie', cookie)
			.send({ otp: 'asd123' })
			.expect(200);
		expect(typeof result.body.user).toEqual('string');
		expect(result.body.user).toHaveLength(36);
	});

	it('get status 400, otp not matched', async () => {
		const spyOtp = jest.spyOn(otpGenerate, 'generate').mockReturnValue('asd123');

		const signup = await request(app)
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

		const cookie = signup.get('Set-Cookie');

		const result = await request(app)
			.post('/api/v1/auth/verify/')
			.set('Cookie', cookie)
			.send({ otp: 'wrong otp' })
			.expect(400);
		expect(result.body.errors[0].message).toEqual('OTP not matched');
	});

	it('get status 400, otp has expired', async () => {
		jest
			.spyOn(global.Date, 'now')
			.mockImplementationOnce(() => new Date('2019-05-14T11:01:58.135Z').valueOf());
		const spyOtp = jest.spyOn(otpGenerate, 'generate').mockReturnValue('asd123');

		const signup = await request(app)
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

		const cookie = signup.get('Set-Cookie');

		const result = await request(app)
			.post('/api/v1/auth/verify/')
			.set('Cookie', cookie)
			.send({ otp: 'asd123' })
			.expect(400);
		expect(result.body.errors[0].message).toEqual('OTP expired');
	});

	it('get status 400, otp already in use', async () => {
		const spyOtp = jest.spyOn(otpGenerate, 'generate').mockReturnValue('asd123');

		const signup = await request(app)
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

		const cookie = signup.get('Set-Cookie');

		await request(app)
			.post('/api/v1/auth/verify/')
			.set('Cookie', cookie)
			.send({ otp: 'asd123' })
			.expect(200);

		const result = await request(app)
			.post('/api/v1/auth/verify/')
			.set('Cookie', cookie)
			.send({ otp: 'asd123' })
			.expect(400);
		expect(result.body.errors[0].message).toEqual('OTP already used');
	});

	it('get status 400, details must be provided', async () => {
		const spyOtp = jest.spyOn(otpGenerate, 'generate').mockReturnValue('asd123');

		const signup = await request(app)
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

		const result = await request(app)
			.post('/api/v1/auth/verify/')
			.send({ otp: 'asd123' })
			.expect(400);
		expect(result.body.errors[0].message).toEqual('details must be provided');
	});

	it('get status 400, details must be provided', async () => {
		const spyOtp = jest.spyOn(otpGenerate, 'generate').mockReturnValue('asd123');

		const signup = await request(app)
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
		const cookie = [
			'session=eyJkZXRhaWxzIjoicndtUm9KZ3dYN3JiM0c2ak5aUUJTaUdRazBXY09UY2FwWW5ubWRVdmJzZGdJMHovbGo5eFV4VmRFL1VSZmtQdnVJeUxNajJpWmx6MkJEUXNWVGQvRGF0M1VQc3lONDQrTktmTGdubHdBM0EyRXFTR3RLcHVRa1pKTzlLeHQ5M3FqOXd2dFRHU0dZTjJad2w4ZXMwbWxLY2I1bzNzeXhjQXExNktuZnQvUlQ4QmFCRHZnMDIxR0F6eXV0NjlOMHdrdlliejVOYi9ER1FPOWlxZnNTNTk2dz09In0=; path=/; httponly',
		];

		const result = await request(app)
			.post('/api/v1/auth/verify/')
			.set('Cookie', cookie)
			.send({ otp: 'asd123' })
			.expect(400);
		expect(result.body.errors[0].message).toEqual('OTP not exist');
	});
});
