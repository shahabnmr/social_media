import request from 'supertest';
import { app } from '../../../app';
import { insertSubCategory } from '../../../test/setup';

describe('get sub_categories of category', () => {
	it('get 200 status code, list of sub_category', async () => {
		await insertSubCategory('laptop', 'electronic');
		const result = await request(app).get('/api/v1/product/get_sub_category/_/electronic');
		expect(result.body.result[0].name).toEqual('laptop');
	});
});
