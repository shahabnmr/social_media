import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';

const email = 'test@test.com';
describe('get profile', () => {
	it('return 400, you must signed in', async () => {
		await request(app).get('/api/v1/auth/profile').send().expect(401);
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
		expect(res.body.user.roll).toEqual('user');
	});
});
