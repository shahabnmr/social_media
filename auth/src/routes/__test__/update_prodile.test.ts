import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { signin } from '../../test/setup';

const email = 'asdadal@gmail.com';

describe('update profile', () => {
	it('get status 200 and updated prodile', async () => {
		const { cookie } = await signin();
		const result = await request(app)
			.put('/api/v1/auth/profile')
			.set('Cookie', cookie)
			.send({
				name: 'ali',
				family: 'ghodrat',
				tell: '12345678901',
				email: 'ali@asd.com',
			})
			.expect(200);
		expect(result.body.message).toEqual('updated');
	});

	it('get status 400 and you must sign in or sign up', async () => {
		const result = await request(app).put('/api/v1/auth/profile').send({
			name: 'ali',
			family: 'ghodrat',
			tell: '12345678901',
			email: 'ali@asd.com',
		});
		expect(result.body.errors[0].message).toEqual('you must sign in or sign up first');
	});
});
