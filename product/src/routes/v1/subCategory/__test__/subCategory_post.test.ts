import request from 'supertest';
import { app } from '../../../../app';
import { insertCategory, insertField, insertSubCategory } from '../../../../test/setup';

describe('insert field', () => {
	it('get 201 status code for insert field', async () => {
		const result = await request(app)
			.post('/api/v1/product/sub_category/field')
			.send({
				name: 'ram',
				type: 'text',
				metadata: '',
			})
			.expect(201);

		expect(result.body.fieldId).toHaveLength(36);
	});

	it('get 400 status code for insert field without name', async () => {
		const result = await request(app)
			.post('/api/v1/product/sub_category/field')
			.send({
				type: 'text',
				metadata: '',
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('Invalid value');
	});
});

describe('insert fields for subCategory', () => {
	it('get 201 status code for insert fields for sub_category', async () => {
		const field = await insertField('ram');
		const field1 = await insertField('cpu');
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.send({
				subCategory_id: subCategory.body.subCategoryId,
				field_ids: [field.body.fieldId, field1.body.fieldId],
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
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.send({
				subCategory_id: subCategory.body.subCategoryId,
				field_ids: ['incorrect'],
			})
			.expect(400);

		expect(result.body.errors[0].message).toEqual('invalid field_ids');
	});
});

describe('insert subCategory', () => {
	it('got 201 statusCode for insert sub_category', async () => {
		const category = await insertCategory('electronic');

		return await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: category.body.categoryId,
			})
			.expect(201);
	});

	it('got 400 statusCode for insert sub_category with incorrect category_id', async () => {
		return await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: 'incorrect category_id',
			})
			.expect(400);
	});

	it('got 400 statusCode for insert sub_category without name', async () => {
		const category = await insertCategory('electronic');

		return await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				category_id: category.body.categoryId,
			})
			.expect(400);
	});

	it('got 400 statusCode for insert sub_category duplicate name', async () => {
		const category = await insertCategory('electronic');

		await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: category.body.categoryId,
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: category.body.categoryId,
			})
			.expect(400);
	});
});
