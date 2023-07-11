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
} from '../../../../test/setup';

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

describe('insert_product_color', () => {
	it('get 201 status code for insert color of product', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const field = await insertField('ram');
		const brand = await insertBrand('sony');
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId);
		const product = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);
		const product1 = await insertProduct(
			'name 2',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);
		const product3 = await insertProduct(
			'name 3',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);
		const color = await insertColor('blue', '#123456');
		const color1 = await insertColor('red', '#123486');
		const color2 = await insertColor('orange', '#103486');

		const result = await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product.body.product.id,
			color_id: color.body.colorId,
			amount: '10',
		});
		const result1 = await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product1.body.product.id,
			color_id: color.body.colorId,
			amount: '10',
		});
		await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product1.body.product.id,
			color_id: color1.body.colorId,
			amount: '2',
		});
		await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product1.body.product.id,
			color_id: color2.body.colorId,
			amount: '4',
		});
		await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product3.body.product.id,
			color_id: color2.body.colorId,
			amount: '0',
		});

		expect(result.body.message).toEqual('insert successfl');
	});

	it('get 400 status code for product not exist', async () => {
		const color = await insertColor('blue', '#123456');

		const result = await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: 'c12f5b08-23cd-401d-8ead-d900d23c83cb',
			color_id: color.body.colorId,
			amount: '10',
		});

		expect(result.body.errors[0].message).toEqual(
			'this product not exist: c12f5b08-23cd-401d-8ead-d900d23c83cb',
		);
	});

	it('get 400 status code for colorId not exist', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const field = await insertField('ram');
		const brand = await insertBrand('sony');
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId);
		const product = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const result = await request(app).post('/api/v1/product/color_of_product/').send({
			product_id: product.body.product.id,
			color_id: 'c12f5b08-23cd-401d-8ead-d900d23c83cb',
			amount: '10',
		});

		expect(result.body.errors[0].message).toEqual(
			'this colorId not exist: c12f5b08-23cd-401d-8ead-d900d23c83cb',
		);
	});
});
