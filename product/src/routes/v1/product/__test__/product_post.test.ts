import request from 'supertest';
import { app } from '../../../../app';
import {
	insertBrand,
	insertBrandToSubCategory,
	insertCategory,
	insertField,
	insertFieldsSubCategory,
	insertSubCategory,
} from '../../../../test/setup';
import { natsWrapper } from '../../../../nats-wrapper';
import { signin } from '../../../../test/setup';
import { cookie } from 'express-validator';

describe('insert product', () => {
	it('get 201 status code for insert product', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);

		const result = await request(app)
			.post('/api/v1/product/')
			.set('Cookie', cookie)
			.send({
				name: 'z5 laptop',
				description: 'this is a good laptop',
				price: '155',
				sub_category_id: subCategory.body.subCategoryId,
				fields: [{ fieldId: field.body.fieldId, value: '256' }],
				brandId: brand.body.brandId,
			});

		expect(result.body.product.name).toEqual('z5 laptop');
		expect(result.body.product.description).toEqual('this is a good laptop');
	});

	it('get 401 status code for unauthorized', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);

		const result = await request(app)
			.post('/api/v1/product/')
			.send({
				name: 'z5 laptop',
				description: 'this is a good laptop',
				price: '155',
				sub_category_id: subCategory.body.subCategoryId,
				fields: [{ fieldId: field.body.fieldId, value: '256' }],
				brandId: brand.body.brandId,
			});

		expect(result.body.errors[0].message).toEqual('Not authorized');
	});

	it('emit event product created', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);

		const result = await request(app)
			.post('/api/v1/product/')
			.set('Cookie', cookie)
			.send({
				name: 'z5 laptop',
				description: 'this is a good laptop',
				price: '155',
				sub_category_id: subCategory.body.subCategoryId,
				fields: [{ fieldId: field.body.fieldId, value: '256' }],
				brandId: brand.body.brandId,
			});

		expect(result.body.product.name).toEqual('z5 laptop');
		expect(natsWrapper.client.publish).toHaveBeenCalled();
	});

	it('get 400 status code for insert incorrect name or description or price or sub_category_id or fields or brands', async () => {
		const cookie = await signin();
		const result = await request(app).post('/api/v1/product/').set('Cookie', cookie).send({
			name: '',
			description: '',
			price: '',
			sub_category_id: '',
			fields: '',
			brandId: '',
		});

		expect(result.body.errors[0].message).toEqual('name is not valid');
		expect(result.body.errors[1].message).toEqual('price is not valid');
		expect(result.body.errors[2].message).toEqual('sub_category_id is not valid');
		expect(result.body.errors[3].message).toEqual('fields is not valid');
		expect(result.body.errors[4].message).toEqual('brandId is not valid');
	});

	it('get 400 status code for insert product with this subCategory not have this brand', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const anotherSubCategory = await insertSubCategory('mobile', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);

		const result = await request(app)
			.post('/api/v1/product/')
			.set('Cookie', cookie)
			.send({
				name: 'z5 laptop',
				description: 'this is a good laptop',
				price: '155',
				sub_category_id: anotherSubCategory.body.subCategoryId,
				fields: [{ fieldId: field.body.fieldId, value: '256' }],
				brandId: brand.body.brandId,
			});

		expect(result.body.errors[0].message).toEqual('this subCategory not have this brand');
	});

	it('get 400 status code for insert product with incorrect fieldId', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);

		const result = await request(app)
			.post('/api/v1/product/')
			.set('Cookie', cookie)
			.send({
				name: 'z5 laptop',
				description: 'this is a good laptop',
				price: '155',
				sub_category_id: subCategory.body.subCategoryId,
				fields: [{ fieldId: 'c12f5b08-23cd-401d-8ead-d900d23c83cb', value: '256' }],
				brandId: brand.body.brandId,
			});

		expect(result.body.errors[0].message).toEqual(
			`this field must be provide id:${field.body.fieldId}, name:ram`,
		);
	});

	it('get 400 status code for insert product if name be duplicated', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);

		await request(app)
			.post('/api/v1/product/')
			.set('Cookie', cookie)
			.send({
				name: 'z5 laptop',
				description: 'this is a good laptop',
				price: '155',
				sub_category_id: subCategory.body.subCategoryId,
				fields: [{ fieldId: field.body.fieldId, value: '256' }],
				brandId: brand.body.brandId,
			});

		const result = await request(app)
			.post('/api/v1/product/')
			.set('Cookie', cookie)
			.send({
				name: 'z5 laptop',
				description: 'this is a good laptop',
				price: '155',
				sub_category_id: subCategory.body.subCategoryId,
				fields: [{ fieldId: field.body.fieldId, value: '256' }],
				brandId: brand.body.brandId,
			});

		expect(result.body.errors[0].message).toEqual('this product name already exist: z5 laptop');
	});
});
