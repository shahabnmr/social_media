import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';
import { natsWrapper } from '../../nats-wrapper';

const email = 'test@test.com';
describe('sign out', () => {
	it('details must be provided', async () => {
		await request(app).post('/api/v1/auth/signout').send().expect(400);
	});

	it('you are Not signedIn', async () => {
		const { details } = await signin();
		await request(app).post('/api/v1/auth/signout').set('Cookie', details).send().expect(400);
	});

	it('successful signout', async () => {
		const { cookie } = await signin();
		await request(app).post('/api/v1/auth/signout').set('Cookie', cookie).send().expect(200);
	});

	it('emit event signup', async () => {
		const { cookie } = await signin();
		await request(app).post('/api/v1/auth/signout').set('Cookie', cookie).send().expect(200);

		expect(natsWrapper.client.publish).toHaveBeenCalled();
	});
});
