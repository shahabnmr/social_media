import request from 'supertest';
import { app } from '../../../app';
import { insertBrand } from '../../../test/setup';

describe('get brands', () => {
	it('get status code 200, and get brands', async () => {
		await insertBrand('sony');
		await insertBrand('samsung');
		const result = await request(app).get('/api/v1/product/brands/get');

		expect(result.body.result[0].name).toEqual('sony');
		expect(result.body.result[1].name).toEqual('samsung');
	});
});
