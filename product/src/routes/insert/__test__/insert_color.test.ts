import request from 'supertest';
import { app } from '../../../app';

describe('insert color', () => {
	it('get 201 status code for insert color', async () => {
		return request(app)
			.post('/api/v1/product/color')
			.send({
				name: 'blue',
				code_color: '#123456',
			})
			.expect(201);
	});

	it('get 400 status code in insert color without name', async () => {
		const result = await request(app)
			.post('/api/v1/product/color')
			.send({
				code_color: '#123456',
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('Invalid value');
	});

	it('get 400 status code in insert color with incorrect code_color', async () => {
		const result = await request(app)
			.post('/api/v1/product/color')
			.send({
				name: 'blue',
				code_color: 'incorrect code color',
			})
			.expect(400);
		expect(result.body.errors[0].message).toEqual('code_color is not valid');
	});
});
