import request from 'supertest';
import { app } from '../../../../app';
import { signin } from '../../../../test/setup';

describe('insert category', () => {
	it('get 201 status code for insert category', async () => {
		const cookie = await signin();
		return request(app)
			.post('/api/v1/product/category/')
			.set('Cookie', cookie)
			.send({
				name: 'electronics',
			})
			.expect(201);
	});

	it('get 401 status code for unauthorized', async () => {
		return request(app)
			.post('/api/v1/product/category/')
			.send({
				name: 'electronics',
			})
			.expect(401);
	});

	it('get 400 status code for duplicate name insert category', async () => {
		const cookie = await signin();
		await request(app)
			.post('/api/v1/product/category/')
			.set('Cookie', cookie)
			.send({
				name: 'electronics',
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/category/')
			.set('Cookie', cookie)
			.send({
				name: 'electronics',
			})
			.expect(400);
	});

	it('got 400 status code for insert category without name', async () => {
		const cookie = await signin();
		return request(app).post('/api/v1/product/category/').set('Cookie', cookie).expect(400);
	});

	it('got categoryId for insert category', async () => {
		const cookie = await signin();
		const category = await request(app)
			.post('/api/v1/product/category/')
			.set('Cookie', cookie)
			.send({
				name: 'electronics',
			})
			.expect(201);

		expect(category.body.categoryId).toHaveLength(36);
	});
});
