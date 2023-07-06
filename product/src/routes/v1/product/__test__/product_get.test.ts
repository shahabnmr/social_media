import request from 'supertest';
import { app } from '../../../../app';
import { insertProduct } from '../../../../test/setup';

describe('get product', () => {
	it('get 200 status code and product info', async () => {
		const product = await insertProduct('name A', '', '', '');

		const result = await request(app).get(`/api/v1/product/product/${product.body.product.id}`);

		expect(result.body.result.id).toEqual(product.body.product.id);
	});

	it('get 400 status code for invalid productId', async () => {
		const result = await request(app).get(`/api/v1/product/product/123549642asdpojr09jdfk;`);

		expect(result.body.errors[0].message).toEqual('productId is invalid');
	});

	it('get all product', async () => {
		const product1 = await insertProduct('name 1', '', '', '');

		const product2 = await insertProduct(
			'name 2',
			product1.body.product.fields[0].fieldId,
			product1.body.product.brandId,
			product1.body.product.sub_category_id,
		);

		const result = await request(app).get('/api/v1/product/products');

		expect(result.body.result[0].id).toEqual(product1.body.product.id);
		expect(result.body.result[1].id).toEqual(product2.body.product.id);
	});
});
