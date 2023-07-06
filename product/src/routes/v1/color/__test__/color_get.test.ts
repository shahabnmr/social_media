import request from 'supertest';
import { app } from '../../../../app';
import { insertColor } from '../../../../test/setup';

describe('get colors', () => {
	it('get 200 status code and get list of all colors', async () => {
		await insertColor('blue', '#123456');
		await insertColor('red', '#123321');
		const result = await request(app).get('/api/v1/product/colors/');

		expect(result.body.result).toHaveLength(2);
	});
});
