import request from 'supertest';
import { app } from '../../../../app';
import { insertColor, signin } from '../../../../test/setup';

describe('get colors', () => {
	it('get 200 status code and get list of all colors', async () => {
		const cookie = await signin();
		await insertColor('blue', '#123456', cookie);
		await insertColor('red', '#123321', cookie);
		const result = await request(app).get('/api/v1/product/colors/');

		expect(result.body.result).toHaveLength(2);
	});
});
