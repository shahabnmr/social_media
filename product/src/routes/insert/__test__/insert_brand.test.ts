import request from 'supertest';
import { app } from '../../../app';

describe('insert brand', () => {
	it('get 201 statusCode for insert brand', async () => {
		return request(app)
			.post('/api/v1/product/brand/insert/')
			.send({
				name: 'sony',
				description: 'this is sony brand',
			})
			.expect(201);
	});

	it('get 400 statusCode for insert brand without name', async () => {
		return request(app)
			.post('/api/v1/product/brand/insert/')
			.send({
				description: 'this is sony brand',
			})
			.expect(400);
	});

	it('get 400 statusCode for insert brand without description', async () => {
		return request(app)
			.post('/api/v1/product/brand/insert/')
			.send({
				name: 'sony',
			})
			.expect(400);
	});

	it('get 400 statusCode for insert brand duplicate name', async () => {
		await request(app)
			.post('/api/v1/product/brand/insert/')
			.send({
				name: 'sony',
				description: 'this is sony brand',
			})
			.expect(201);

		await request(app)
			.post('/api/v1/product/brand/insert/')
			.send({
				name: 'sony',
				description: 'this is sony brand',
			})
			.expect(400);
	});
});
