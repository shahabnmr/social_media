import request from 'supertest';
import { app } from '../../../app';
import { insertField } from '../../../test/setup';

describe('get fields', () => {
	it('get 200 status code, and list of fields', async () => {
		await insertField('ram');
		await insertField('cpu');
		const result = await request(app).get('/api/v1/product/sub_category/all/fields/');

		expect(result.body.result[0].name).toEqual('ram');
		expect(result.body.result[1].name).toEqual('cpu');
	});
});
