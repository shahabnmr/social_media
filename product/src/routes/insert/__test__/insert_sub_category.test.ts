import request from 'supertest';
import { app } from '../../../app';

describe('insert subCategory', () => {
	it('got 201 statusCode for insert sub_category', async () => {
		const category = await request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(201);

		return await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: category.body.category,
			})
			.expect(201);
	});

	it('got 400 statusCode for insert sub_category with incorrect category_id', async () => {
		return await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: 'incorerct category_id',
			})
			.expect(400);
	});

	it('got 400 statusCode for insert sub_category without name', async () => {
		const category = await request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(201);
		return await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				category_id: category.body.category,
			})
			.expect(400);
	});

	it('got 400 statusCode for insert sub_category duplicate name', async () => {
		const category = await request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: category.body.category,
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/sub_category')
			.send({
				name: 'laptop',
				category_id: category.body.category,
			})
			.expect(400);
	});
});
