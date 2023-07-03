import request from 'supertest';
import { app } from '../../../app';
import { insertBrand, insertSubCategory } from '../../../test/setup';

describe('insert brand to sub_category', () => {
	it('get 201 statusCode for insert brand to sub_category', async () => {
		const subCategory = await insertSubCategory('laptop', 'electronics');

		const brand = await insertBrand('sony');

		return request(app)
			.post('/api/v1/product/brand/insert/to_sub_category/')
			.send({
				sub_category_id: subCategory.body.subCategoryId,
				brands: [brand.body.result],
			})
			.expect(201);
	});

	it('get 400 statusCode for insert brand with brandId incorrect', async () => {
		const subCategory = await insertSubCategory('laptop', 'electrincs');

		const result = await request(app)
			.post('/api/v1/product/brand/insert/to_sub_category/')
			.send({
				sub_category_id: subCategory.body.subCategoryId,
				brands: ['incorrect brand id'],
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('brand ids in not valid');
	});

	it('get 400 statusCode for insert brand with sub_category_id incorrect', async () => {
		const brand = await insertBrand('sony');

		const result = await request(app)
			.post('/api/v1/product/brand/insert/to_sub_category/')
			.send({
				sub_category_id: 'incorrect sub_category_id',
				brands: [brand.body.result],
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('sub_category_id is not valid');
	});
});
