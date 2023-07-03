import request from 'supertest';
import { app } from '../../../app';
import { insertField, insertSubCategory } from '../../../test/setup';

describe('insert fields for subCategory', () => {
	it('get 201 status code for insert fields for sub_category', async () => {
		const field = await insertField('ram');
		const subCategory = await insertSubCategory('laptop', 'electronics');
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.send({
				subCategory_id: subCategory.body.subCategoryId,
				field_ids: [field.body.fieldId],
			})
			.expect(201);

		expect(result.body.message).toEqual('success insert Fields');
	});

	it('get 400 status code for insert fields for sub_category with incorrect subCategoryId', async () => {
		const field = await insertField('ram');
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.send({
				subCategory_id: 'incorrect',
				field_ids: [field.body.fieldId],
			})
			.expect(400);

		expect(result.body.errors[0].message).toEqual('invalid subCategory_id');
	});

	it('get 400 status code for insert fields for sub_category with incorrect field_ids', async () => {
		const subCategory = await insertSubCategory('laptop', 'electronics');
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.send({
				subCategory_id: subCategory.body.subCategoryId,
				field_ids: ['incorerct'],
			})
			.expect(400);

		expect(result.body.errors[0].message).toEqual('invalid field_ids');
	});
});
