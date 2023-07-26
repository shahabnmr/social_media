import request from 'supertest';
import { app } from '../../../../app';
import { insertCategory, insertField, insertSubCategory, signin } from '../../../../test/setup';

describe('insert field', () => {
	it('get 201 status code for insert field', async () => {
		const cookie = await signin();
		const result = await request(app)
			.post('/api/v1/product/sub_category/field')
			.set('Cookie', cookie)
			.send({
				name: 'ram',
				type: 'text',
				metadata: '',
			})
			.expect(201);

		expect(result.body.fieldId).toHaveLength(36);
	});

	it('get 401 status code for unauthorized', async () => {
		const result = await request(app)
			.post('/api/v1/product/sub_category/field')
			.send({
				name: 'ram',
				type: 'text',
				metadata: '',
			})
			.expect(401);

		expect(result.body.errors[0].message).toEqual('Not authorized');
	});

	it('get 400 status code for insert field without name', async () => {
		const cookie = await signin();
		const result = await request(app)
			.post('/api/v1/product/sub_category/field')
			.set('Cookie', cookie)
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
		const cookie = await signin();

		const field = await insertField('ram', cookie);
		const field1 = await insertField('cpu', cookie);
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.set('Cookie', cookie)
			.send({
				subCategory_id: subCategory.body.subCategoryId,
				field_ids: [field.body.fieldId, field1.body.fieldId],
			})
			.expect(201);

		expect(result.body.message).toEqual('success insert Fields');
	});

	it('get 400 status code for insert fields for sub_category with incorrect subCategoryId', async () => {
		const cookie = await signin();

		const field = await insertField('ram', cookie);
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.set('Cookie', cookie)
			.send({
				subCategory_id: 'incorrect',
				field_ids: [field.body.fieldId],
			})
			.expect(400);

		expect(result.body.errors[0].message).toEqual('invalid subCategory_id');
	});

	it('get 400 status code for insert fields for sub_category with incorrect field_ids', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const result = await request(app)
			.post('/api/v1/product/sub_category/add-fields')
			.set('Cookie', cookie)
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
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);

		return await request(app)
			.post('/api/v1/product/sub_category')
			.set('Cookie', cookie)
			.send({
				name: 'laptop',
				category_id: category.body.categoryId,
			})
			.expect(201);
	});

	it('got 400 statusCode for insert sub_category with incorrect category_id', async () => {
		const cookie = await signin();

		return await request(app)
			.post('/api/v1/product/sub_category')
			.set('Cookie', cookie)
			.send({
				name: 'laptop',
				category_id: 'incorrect category_id',
			})
			.expect(400);
	});

	it('got 400 statusCode for insert sub_category without name', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);

		return await request(app)
			.post('/api/v1/product/sub_category')
			.set('Cookie', cookie)
			.send({
				category_id: category.body.categoryId,
			})
			.expect(400);
	});

	it('got 400 statusCode for insert sub_category duplicate name', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);

		await request(app)
			.post('/api/v1/product/sub_category')
			.set('Cookie', cookie)
			.send({
				name: 'laptop',
				category_id: category.body.categoryId,
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/sub_category')
			.set('Cookie', cookie)
			.send({
				name: 'laptop',
				category_id: category.body.categoryId,
			})
			.expect(400);
	});
});
