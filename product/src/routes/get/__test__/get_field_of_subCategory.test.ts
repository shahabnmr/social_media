import request from 'supertest';
import { app } from '../../../app';
import { insertFieldsSubCategory } from '../../../test/setup';

describe('get field of subCategory', () => {
	it('get status code 200, and fields of sub_category', async () => {
		const { field, subCategory } = await insertFieldsSubCategory();
		const result = await request(app).get(
			`/api/v1/product/sub_category/fields/query/?subCategoryId=${subCategory.body.subCategoryId}`,
		);
		expect(result.body.result[0].name).toEqual('ram');
	});
});
