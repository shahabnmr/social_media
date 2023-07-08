import request from 'supertest';
import { app } from '../../../../app';

describe('insert category', () => {
	it('get 201 status code for insert category', async () => {
		return request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(201);
	});

	it('get 400 status code for duplicate name insert category', async () => {
		await request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(400);
	});

	it('got 400 status code for insert category without name', async () => {
		return request(app).post('/api/v1/product/category/').expect(400);
	});

	it('got categoryId for insert category', async () => {
		const category = await request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(201);

		expect(category.body.categoryId).toHaveLength(36);
	});
});
