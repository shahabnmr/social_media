import request from 'supertest';
import { app } from '../../../../app';
import {
	insertCategory,
	insertField,
	insertFieldsSubCategory,
	insertSubCategory,
	signin,
} from '../../../../test/setup';

describe('get field of subCategory', () => {
	it('get status code 200, and fields of sub_category', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const result = await request(app).get(
			`/api/v1/product/sub_category/fields/query/?subCategoryId=${subCategory.body.subCategoryId}`,
		);
		expect(result.body.result[0].name).toEqual('ram');
	});

	it('get 200 status code, and list of fields', async () => {
		const cookie = await signin();

		await insertField('ram', cookie);
		await insertField('cpu', cookie);
		const result = await request(app).get('/api/v1/product/sub_category/all/fields/');

		expect(result.body.result[0].name).toEqual('ram');
		expect(result.body.result[1].name).toEqual('cpu');
	});

	it('get 200 status code, list of sub_category', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const subCategory1 = await insertSubCategory('mobile', category.body.categoryId, cookie);
		const subCategory3 = await insertSubCategory('tablet', category.body.categoryId, cookie);
		const result = await request(app).get('/api/v1/product/get_sub_category/_/electronic');

		expect(result.body.result[0].name).toEqual('laptop');
		expect(result.body.result[1].name).toEqual('mobile');
		expect(result.body.result[2].name).toEqual('tablet');
	});
});
