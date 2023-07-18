import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';

const email = 'test@test.com';
describe('resend otp', () => {
	it('return 400, first signin', async () => {
		await request(app).post('/api/v1/auth/resendotp').send().expect(400);
	});

	it('return 400, last otp have expiration time', async () => {
		const { cookie } = await signin();
		await request(app).post('/api/v1/auth/resendotp').set('Cookie', cookie).send().expect(400);
	});

	it('return 200,after 10 minutes can use resend otp', async () => {
		jest
			.spyOn(global.Date, 'now')
			.mockImplementationOnce(() => new Date('2019-05-14T11:01:58.135Z').valueOf());

		const email = 'test@test.com';

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

		const details = res.get('Set-Cookie');
		await request(app).post('/api/v1/auth/resendotp').set('Cookie', details).send().expect(200);
	});
});
