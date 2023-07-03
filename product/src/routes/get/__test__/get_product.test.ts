import request from 'supertest';
import { app } from '../../../app';
import { insertProduct } from '../../../test/setup';

describe('get product', () => {
	it('get 200 status code and product info', async () => {
		const product = await insertProduct();

		const result = await request(app).get(`/api/v1/product/${product.body.product.id}`);

		expect(result.body.result.id).toEqual(product.body.product.id);
	});

	it('get 400 status code for invalid productId', async () => {
		const result = await request(app).get(`/api/v1/product/123549642asdpojr09jdfk;`);

		expect(result.body.errors[0].message).toEqual('productId is invalid');
	});
});
