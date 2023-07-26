import request from 'supertest';
import { app } from '../../../../app';
import { insertCategory, signin } from '../../../../test/setup';

describe('get list of all categories', () => {
	it('get 200 status code, and list of categories', async () => {
		const cookie = await signin();
		await insertCategory('electronic', cookie);
		await insertCategory('clothes', cookie);

		const result = await request(app).get('/api/v1/product/categories/get-all');

		expect(result.body.result[0].name).toEqual('electronic');
		expect(result.body.result[1].name).toEqual('clothes');
	});

	it('get 200 status code, and get list of empty', async () => {
		const result = await request(app).get('/api/v1/product/categories/get-all');
		expect(result.body.result).toHaveLength(0);
	});
});
