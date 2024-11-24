import request from 'supertest';
import { app } from '../../../../app';
import {
	insertBrand,
	insertBrandToSubCategory,
	insertCategory,
	insertColor,
	insertColorToProduct,
	insertField,
	insertFieldsSubCategory,
	insertProduct,
	insertSubCategory,
	signin,
} from '../../../../test/setup';

describe('delete Color', () => {
	it('get 400 status code and not delete color because color not exist', async () => {
		const cookie = await signin();

		await request(app)
			.put('/api/v1/product/colors/put')
			.set('Cookie', cookie)
			.send({ id: '123qweasdqwe1231ewdsdsad', code_color: '#123qweasd', name: 'red' })
			.expect(400);
	});

	it('get 200 status code and update color', async () => {
		const cookie = await signin();
		const color = await insertColor('blue', '#123456', cookie);

		const updated = await request(app)
			.put('/api/v1/product/colors/put')
			.set('Cookie', cookie)
			.send({ id: color.body.colorId, code_color: '#123qweasd', name: 'red' })
			.expect(200);
		expect(updated.body).toEqual({ updated: true });
	});

	it('update product_color with status 200', async () => {
		const cookie = await signin();
		const color = await insertColor('blue', '#123456', cookie);
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
		const productColor = await insertColorToProduct(
			product.body.product.id,
			color.body.colorId,
			'10',
			cookie,
		);

		const updated = await request(app)
			.put('/api/v1/product/colors/product_color/put')
			.set('Cookie', cookie)
			.send({
				id: color.body.colorId,
				color_id: color.body.colorId,
				product_id: product.body.product.id,
				amount: '1',
			})
			.expect(200);

		expect(updated.body).toEqual({ updated: true });
	});

	it('status 404, not find error for product_color_id', async () => {
		const cookie = await signin();
		const updated = await request(app)
			.put('/api/v1/product/colors/product_color/put')
			.set('Cookie', cookie)
			.send({
				id: '123123weasdsdasdwqedas',
				color_id: '123123weasdsdasdwqedas',
				product_id: '123123weasdsdasdwqedas',
				amount: '1',
			})
			.expect(400);

		expect(updated.body.errors[0].message).toEqual(
			'this colorId not exist: 123123weasdsdasdwqedas',
		);
	});
});
