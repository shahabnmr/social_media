import request from 'supertest';
import { app } from '../../../../app';
import { insertBrand, insertCategory, insertSubCategory, signin } from '../../../../test/setup';

describe('insert brand to sub_category', () => {
	it('get 201 statusCode for insert brand to sub_category', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const brand = await insertBrand('sony', cookie);

		return request(app)
			.post('/api/v1/product/brand/insert/to_sub_category/')
			.set('Cookie', cookie)
			.send({
				sub_category_id: subCategory.body.subCategoryId,
				brands: [brand.body.brandId],
			})
			.expect(201);
	});

	it('get 400 statusCode for insert brand with brandId incorrect', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);

		const result = await request(app)
			.post('/api/v1/product/brand/insert/to_sub_category/')
			.set('Cookie', cookie)
			.send({
				sub_category_id: subCategory.body.subCategoryId,
				brands: ['incorrect brand id'],
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('brand ids in not valid');
	});

	it('get 400 statusCode for insert brand with sub_category_id incorrect', async () => {
		const cookie = await signin();
		const brand = await insertBrand('sony', cookie);

		const result = await request(app)
			.post('/api/v1/product/brand/insert/to_sub_category/')
			.set('Cookie', cookie)
			.send({
				sub_category_id: 'incorrect sub_category_id',
				brands: [brand.body.result],
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('sub_category_id is not valid');
	});
});

describe('insert brand', () => {
	it('get 201 statusCode for insert brand', async () => {
		const cookie = await signin();
		return request(app)
			.post('/api/v1/product/brand/insert/')
			.set('Cookie', cookie)
			.send({
				name: 'sony',
				description: 'this is sony brand',
			})
			.expect(201);
	});

	it('get 401 statusCode for unauthorized', async () => {
		return request(app)
			.post('/api/v1/product/brand/insert/')
			.send({
				name: 'sony',
				description: 'this is sony brand',
			})
			.expect(401);
	});

	it('get 400 statusCode for insert brand without name', async () => {
		const cookie = await signin();
		return request(app)
			.post('/api/v1/product/brand/insert/')
			.set('Cookie', cookie)
			.send({
				description: 'this is sony brand',
			})
			.expect(400);
	});

	it('get 400 statusCode for insert brand without description', async () => {
		const cookie = await signin();
		return request(app)
			.post('/api/v1/product/brand/insert/')
			.set('Cookie', cookie)
			.send({
				name: 'sony',
			})
			.expect(400);
	});

	it('get 400 statusCode for insert brand duplicate name', async () => {
		const cookie = await signin();
		await request(app)
			.post('/api/v1/product/brand/insert/')
			.set('Cookie', cookie)
			.send({
				name: 'sony',
				description: 'this is sony brand',
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/brand/insert/')
			.set('Cookie', cookie)
			.send({
				name: 'sony',
				description: 'this is sony brand',
			})
			.expect(400);
	});
});
