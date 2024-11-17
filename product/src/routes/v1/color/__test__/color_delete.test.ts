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

describe('delete Color', () => {
	it('get 400 status code and not delete color because exist color on product', async () => {
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

		const x = await request(app)
			.post('/api/v1/product/color_of_product/')
			.set('Cookie', cookie)
			.send({
				product_id: product.body.product.id,
				color_id: color.body.colorId,
				amount: 10,
			})
			.expect(201);
		console.log(color.body.colorId, x.body);

		const result = await request(app)
			.delete('/api/v1/product/colors/delete')
			.set('Cookie', cookie)
			.send({ color_id: color.body.colorId })
			.expect(400);

		expect(result.body.errors[0].message).toEqual(
			`this Product: ${product.body.product.id} has this color: ${color.body.colorId}, first delete color for this product.`,
		);
	});

	it('get 200 status code and delete color', async () => {
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

		const result = await request(app)
			.delete('/api/v1/product/colors/delete')
			.set('Cookie', cookie)
			.send({ color_id: color.body.colorId })
			.expect(200);

		expect(result.body).toEqual({ deleted: true });
	});

	it('get 404 status code and color not Found', async () => {
		const cookie = await signin();

		const colorId = '1234679845613216546541';
		const result = await request(app)
			.delete('/api/v1/product/colors/delete')
			.set('Cookie', cookie)
			.send({ color_id: colorId })
			.expect(400);

		expect(result.body.errors[0].message).toEqual(`this colorId not exist: ${colorId}`);
	});
});
