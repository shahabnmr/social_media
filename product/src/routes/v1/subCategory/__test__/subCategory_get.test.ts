import request from 'supertest';
import { app } from '../../../../app';
import {
	insertCategory,
	insertField,
	insertFieldsSubCategory,
	insertSubCategory,
} from '../../../../test/setup';

describe('get field of subCategory', () => {
	it('get status code 200, and fields of sub_category', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const field = await insertField('ram');
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId);
		const result = await request(app).get(
			`/api/v1/product/sub_category/fields/query/?subCategoryId=${subCategory.body.subCategoryId}`,
		);
		expect(result.body.result[0].name).toEqual('ram');
	});

	it('get 200 status code, and list of fields', async () => {
		await insertField('ram');
		await insertField('cpu');
		const result = await request(app).get('/api/v1/product/sub_category/all/fields/');

		expect(result.body.result[0].name).toEqual('ram');
		expect(result.body.result[1].name).toEqual('cpu');
	});

	it('get 200 status code, list of sub_category', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const subCategory1 = await insertSubCategory('mobile', category.body.categoryId);
		const subCategory3 = await insertSubCategory('tablet', category.body.categoryId);
		const result = await request(app).get('/api/v1/product/get_sub_category/_/electronic');

		expect(result.body.result[0].name).toEqual('laptop');
		expect(result.body.result[1].name).toEqual('mobile');
		expect(result.body.result[2].name).toEqual('tablet');
	});
});
