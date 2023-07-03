import request from 'supertest';
import { app } from '../../../app';

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
