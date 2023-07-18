import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';

const email = 'test@test.com';
describe('forget password', () => {
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
});
