import request from 'supertest';
import { app } from '../../../../app';
import {
	insertBrand,
	insertBrandToSubCategory,
	insertCategory,
	insertColor,
	insertField,
	insertFieldsSubCategory,
	insertProduct,
	insertSubCategory,
	signin,
} from '../../../../test/setup';

describe('delete Color', () => {
	it('get 400 status code and not delete color because color not exist', async () => {
		const cookie = await signin();

		await request(app)
			.put('/api/v1/product/colors/put')
			.set('Cookie', cookie)
			.send({ id: '123qweasdqwe1231ewdsdsad', code_color: '#123qweasd', name: 'red' })
			.expect(400);
	});

	it('get 200 status code and update color', async () => {
		const cookie = await signin();
		const color = await insertColor('blue', '#123456', cookie);

		const updated = await request(app)
			.put('/api/v1/product/colors/put')
			.set('Cookie', cookie)
			.send({ id: color.body.colorId, code_color: '#123qweasd', name: 'red' })
			.expect(200);
		expect(updated.body).toEqual({ updated: true });
	});
});
