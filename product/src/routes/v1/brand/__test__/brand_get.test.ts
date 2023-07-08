import request from 'supertest';
import { app } from '../../../../app';
import {
	insertBrand,
	insertBrandToSubCategory,
	insertCategory,
	insertSubCategory,
} from '../../../../test/setup';

describe('get brands of sub category', () => {
	it('get 200 status code and list of brands of sub category', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const brand = await insertBrand('sony');
		const brandInserted = await insertBrandToSubCategory(
			subCategory.body.subCategoryId,
			brand.body.brandId,
		);
		const result = await request(app).get(
			`/api/v1/product/brandsOf/${subCategory.body.subCategoryId}`,
		);

		expect(result.body.result[0].name).toEqual('sony');
	});

	it('get status code 200, and get all brands', async () => {
		await insertBrand('sony');
		await insertBrand('samsung');
		const result = await request(app).get('/api/v1/product/brands/get');

		expect(result.body.result[0].name).toEqual('sony');
		expect(result.body.result[1].name).toEqual('samsung');
	});
});
