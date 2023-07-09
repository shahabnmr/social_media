import request from 'supertest';
import { app } from '../../../../app';
import {
	insertBrand,
	insertBrandToSubCategory,
	insertCategory,
	insertField,
	insertFieldsSubCategory,
	insertProduct,
	insertSubCategory,
} from '../../../../test/setup';

describe('get product', () => {
	it('get 200 status code and product info', async () => {
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

		const result = await request(app).get(`/api/v1/product/product/${product.body.product.id}`);

		expect(result.body.result.id).toEqual(product.body.product.id);
	});

	it('get 400 status code for invalid productId', async () => {
		const result = await request(app).get(`/api/v1/product/product/123549642asdpojr09jdfk;`);

		expect(result.body.errors[0].message).toEqual('productId is invalid');
	});

	it('get all product', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const field = await insertField('ram');
		const brand = await insertBrand('sony');
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);
		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const result = await request(app).get('/api/v1/product/products');

		expect(result.body.result[0].id).toEqual(product1.body.product.id);
		expect(result.body.result[1].id).toEqual(product2.body.product.id);
	});

	it('get all product of subCategory', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const field = await insertField('ram');
		const brand = await insertBrand('sony');
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const category1 = await insertCategory('clothes');
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId);
		const field1 = await insertField('height');
		const brand1 = await insertBrand('adidas');
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId);
		const product3 = await insertProduct(
			'clothes1',
			'abcd',
			'150',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
		);

		const result = await request(app)
			.get('/api/v1/product/products/sub_category/')
			.query({ subCategoryId: subCategory.body.subCategoryId });

		expect(result.body.result[0].id).toEqual(product1.body.product.id);
		expect(result.body.result[1].id).toEqual(product2.body.product.id);
		expect(result.body.result).toHaveLength(2);
	});

	it('get all product of category', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const field = await insertField('ram');
		const brand = await insertBrand('sony');
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const category1 = await insertCategory('clothes');
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId);
		const field1 = await insertField('height');
		const brand1 = await insertBrand('adidas');
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId);
		const product3 = await insertProduct(
			'clothes1',
			'abcd',
			'150',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
		);

		const result = await request(app)
			.get('/api/v1/product/products/category/')
			.query({ categoryId: category.body.categoryId });

		expect(result.body.result[0].id).toEqual(product1.body.product.id);
		expect(result.body.result[1].id).toEqual(product2.body.product.id);
		expect(result.body.result).toHaveLength(2);
	});

	it('search all product', async () => {
		const category = await insertCategory('electronic');
		const subCategory = await insertSubCategory('laptop', category.body.categoryId);
		const field = await insertField('ram');
		const brand = await insertBrand('sony');
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId);
		const product1 = await insertProduct(
			'this is name one',
			'this is description good',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const product2 = await insertProduct(
			'my name is ali and jafar',
			'my description is bad',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
		);

		const category1 = await insertCategory('clothes');
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId);
		const field1 = await insertField('height');
		const brand1 = await insertBrand('adidas');
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId);
		const product3 = await insertProduct(
			'my name is good clothes',
			'description is for test thats it',
			'150',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
		);

		const result = await request(app)
			.get('/api/v1/product/products/search/all')
			.send({ text: 'good' });

		expect(result.body.result[0].id).toEqual(product3.body.product.id);
		expect(result.body.result[1].id).toEqual(product1.body.product.id);
		expect(result.body.result).toHaveLength(2);
	});
});
