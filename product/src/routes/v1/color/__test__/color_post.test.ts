import request from 'supertest';
import { app } from '../../../../app';
import { insertColor, insertProduct } from '../../../../test/setup';

describe('insert color', () => {
	it('get 201 status code for insert color', async () => {
		return request(app)
			.post('/api/v1/product/color')
			.send({
				name: 'blue',
				code_color: '#123456',
			})
			.expect(201);
	});

	it('get 400 status code in insert color without name', async () => {
		const result = await request(app)
			.post('/api/v1/product/color')
			.send({
				code_color: '#123456',
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('Invalid value');
	});

	it('get 400 status code in insert color with incorrect code_color', async () => {
		const result = await request(app)
			.post('/api/v1/product/color')
			.send({
				name: 'blue',
				code_color: 'incorrect code color',
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('code_color is not valid');
	});
});

describe('insert_product_color', () => {
	it('get 201 status code for insert color of product', async () => {
		const product = await insertProduct();
		const color = await insertColor('blue', '#123456');

		const result = await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product.body.product.id,
			color_id: color.body.colorId,
			amount: '10',
		});

		expect(result.body.colorOfProductId).toHaveLength(36);
	});

	it('get 400 status code for product not exist', async () => {
		const color = await insertColor('blue', '#123456');

		const result = await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: 'c12f5b08-23cd-401d-8ead-d900d23c83cb',
			color_id: color.body.colorId,
			amount: '10',
		});

		expect(result.body.errors[0].message).toEqual(
			'this product not exist: c12f5b08-23cd-401d-8ead-d900d23c83cb',
		);
	});

	it('get 400 status code for colorId not exist', async () => {
		const product = await insertProduct();

		const result = await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product.body.product.id,
			color_id: 'c12f5b08-23cd-401d-8ead-d900d23c83cb',
			amount: '10',
		});

		expect(result.body.errors[0].message).toEqual(
			'this colorId not exist: c12f5b08-23cd-401d-8ead-d900d23c83cb',
		);
	});
});
