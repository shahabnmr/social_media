import request from 'supertest';
import { app } from '../../../../app';
import {
	insertBrand,
	insertBrandToSubCategory,
	insertCategory,
	insertColor,
	insertField,
	insertFieldsSubCategory,
	insertProduct,
	insertSubCategory,
	signin,
} from '../../../../test/setup';
import { natsWrapper } from '../../../../nats-wrapper';

describe('insert color', () => {
	it('get 201 status code for insert color', async () => {
		const cookie = await signin();
		return request(app)
			.post('/api/v1/product/color')
			.set('Cookie', cookie)
			.send({
				name: 'blue',
				code_color: '#123456',
			})
			.expect(201);
	});

	it('get 401 status code for unauthorized', async () => {
		return request(app)
			.post('/api/v1/product/color')
			.send({
				name: 'blue',
				code_color: '#123456',
			})
			.expect(401);
	});

	it('get 400 status code in insert color without name', async () => {
		const cookie = await signin();
		const result = await request(app)
			.post('/api/v1/product/color')
			.set('Cookie', cookie)
			.send({
				code_color: '#123456',
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('Invalid value');
	});

	it('get 400 status code in insert color with incorrect code_color', async () => {
		const cookie = await signin();
		const result = await request(app)
			.post('/api/v1/product/color')
			.set('Cookie', cookie)
			.send({
				name: 'blue',
				code_color: 'incorrect code color',
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('code_color is not valid');
	});
});

describe('insert_product_color', () => {
	it('get 201 status code for insert color of product, and publish new data', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		const product1 = await insertProduct(
			'name 2',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		const product3 = await insertProduct(
			'name 3',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		const color = await insertColor('blue', '#123456', cookie);
		const color1 = await insertColor('red', '#123486', cookie);
		const color2 = await insertColor('orange', '#103486', cookie);

		const result = await request(app)
			.post('/api/v1/product/color_of_product/')
			.set('Cookie', cookie)
			.send({
				product_id: product.body.product.id,
				color_id: color.body.colorId,
				amount: '10',
			});
		const result1 = await request(app)
			.post('/api/v1/product/color_of_product/')
			.set('Cookie', cookie)
			.send({
				product_id: product1.body.product.id,
				color_id: color.body.colorId,
				amount: '10',
			});
		await request(app).post('/api/v1/product/color_of_product/').set('Cookie', cookie).send({
			product_id: product1.body.product.id,
			color_id: color1.body.colorId,
			amount: '2',
		});
		await request(app).post('/api/v1/product/color_of_product/').set('Cookie', cookie).send({
			product_id: product1.body.product.id,
			color_id: color2.body.colorId,
			amount: '4',
		});
		await request(app).post('/api/v1/product/color_of_product/').set('Cookie', cookie).send({
			product_id: product3.body.product.id,
			color_id: color2.body.colorId,
			amount: '0',
		});

		expect(result.body.message).toEqual('insert successful');
		expect(natsWrapper.client.publish).toHaveBeenCalled();
	});

	it('get 400 status code for product not exist', async () => {
		const cookie = await signin();
		const color = await insertColor('blue', '#123456', cookie);

		const result = await request(app)
			.post('/api/v1/product/color_of_product/')
			.set('Cookie', cookie)
			.send({
				product_id: 'c12f5b08-23cd-401d-8ead-d900d23c83cb',
				color_id: color.body.colorId,
				amount: '10',
			});

		expect(result.body.errors[0].message).toEqual(
			'this product not exist: c12f5b08-23cd-401d-8ead-d900d23c83cb',
		);
	});

	it('get 400 status code for colorId not exist', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const result = await request(app)
			.post('/api/v1/product/color_of_product/')
			.set('Cookie', cookie)
			.send({
				product_id: product.body.product.id,
				color_id: 'c12f5b08-23cd-401d-8ead-d900d23c83cb',
				amount: '10',
			});

		expect(result.body.errors[0].message).toEqual(
			'this colorId not exist: c12f5b08-23cd-401d-8ead-d900d23c83cb',
		);
	});
});
