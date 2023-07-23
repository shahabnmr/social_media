import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { signin } from '../../test/setup';
import otpGenerate from 'otp-generator';
import { Roll, UserService } from '../../services/db/psql/user';

const email = 'test@test.com';

describe('verify otp', () => {
	it('get status code 201 and updated roll', async () => {
		const spyOtp = jest.spyOn(otpGenerate, 'generate').mockReturnValue('asd123');

		const signup = await request(app) //user
			.post('/api/v1/auth/signup')
			.send({
				name: 'shahab',
				family: 'asd',
				tell: '58963214785',
				email: 'shahab@shahab.com',
				password: '123qwe',
				confirmPassword: '123qwe',
			})
			.expect(201);

		const result = await request(app)
			.post('/api/v1/auth/verify/')
			.set('Cookie', signup.get('Set-Cookie'))
			.send({ otp: 'asd123' })
			.expect(200);
		expect(typeof result.body.user).toEqual('string');
		expect(result.body.user).toHaveLength(36);

		const { cookie } = await signin(); //admin
		const userService = await UserService.getInstance();
		await userService.updateRoll(email, Roll.Admin);

		const result1 = await request(app).put('/api/v1/auth/update/roll/').set('Cookie', cookie).send({
			email: 'shahab@shahab.com',
			roll: 'admin',
		});
		expect(result1.body.message).toEqual('updated');
		expect(natsWrapper.client.publish).toHaveBeenCalledTimes(5);
		expect(natsWrapper.client.publish).toHaveBeenLastCalledWith(
			'auth:updateRoll',
			'{"email":"shahab@shahab.com","roll":"admin","version":"2"}',
			expect.any(Function),
		);
	});
});
