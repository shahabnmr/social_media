import request from 'supertest';
import { app } from '../../../../app';
import { insertField, insertFieldsSubCategory, insertSubCategory } from '../../../../test/setup';

describe('get field of subCategory', () => {
	it('get status code 200, and fields of sub_category', async () => {
		const { field, subCategory } = await insertFieldsSubCategory();
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
		await insertSubCategory('laptop', 'electronic');
		const result = await request(app).get('/api/v1/product/get_sub_category/_/electronic');
		expect(result.body.result[0].name).toEqual('laptop');
	});
});
