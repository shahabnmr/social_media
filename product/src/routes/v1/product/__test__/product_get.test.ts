import request from 'supertest';
import { app } from '../../../../app';
import {
	insertBrand,
	insertBrandToSubCategory,
	insertCategory,
	insertColor,
	insertColorToProduct,
	insertField,
	insertFieldsSubCategory,
	insertProduct,
	insertSubCategory,
	signin,
} from '../../../../test/setup';

describe('get product', () => {
	it('get 200 status code and product info', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const result = await request(app).get(`/api/v1/product/product/${product.body.product.id}`);

		expect(result.body.result.id).toEqual(product.body.product.id);
	});

	it('get 400 status code for invalid productId', async () => {
		const result = await request(app).get(`/api/v1/product/product/123549642asdpojr09jdfk;`);

		expect(result.body.errors[0].message).toEqual('productId is invalid');
	});

	it('get all products', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const result = await request(app)
			.get('/api/v1/product/products')
			.send({ orderName: 'price', sorting: 'desc', exist: false });

		expect(result.body.result[1].id).toEqual(product1.body.product.id);
		expect(result.body.result[0].id).toEqual(product2.body.product.id);
	});

	it('get all product of subCategory', async () => {
		const cookie = await signin();
		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const category1 = await insertCategory('clothes', cookie);
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId, cookie);
		const field1 = await insertField('height', cookie);
		const brand1 = await insertBrand('adidas', cookie);
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId, cookie);
		const product3 = await insertProduct(
			'clothes1',
			'abcd',
			'150',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
			cookie,
		);

		const result = await request(app)
			.get('/api/v1/product/products/sub_category/')
			.send({ orderName: 'price', sorting: 'desc', exist: false })
			.query({ subCategoryId: subCategory.body.subCategoryId });

		expect(result.body.result[1].id).toEqual(product1.body.product.id);
		expect(result.body.result[0].id).toEqual(product2.body.product.id);
		expect(result.body.result).toHaveLength(2);
	});

	it('get all product of subCategory Exist', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		const color = await insertColor('blue', '#123456', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product1.body.product.id, color.body.colorId, '0', cookie);

		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product2.body.product.id, color.body.colorId, '2', cookie);

		const category1 = await insertCategory('clothes', cookie);
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId, cookie);
		const field1 = await insertField('height', cookie);
		const brand1 = await insertBrand('adidas', cookie);
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId, cookie);
		const product3 = await insertProduct(
			'clothes1',
			'abcd',
			'150',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
			cookie,
		);

		const result = await request(app)
			.get('/api/v1/product/products/sub_category/')
			.send({ orderName: 'price', sorting: 'desc', exist: true })
			.query({ subCategoryId: subCategory.body.subCategoryId });

		expect(result.body.result[0].id).toEqual(product2.body.product.id);
		expect(result.body.result).toHaveLength(1);
	});

	it('get all product of category', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const category1 = await insertCategory('clothes', cookie);
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId, cookie);
		const field1 = await insertField('height', cookie);
		const brand1 = await insertBrand('adidas', cookie);
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId, cookie);
		const product3 = await insertProduct(
			'clothes1',
			'abcd',
			'150',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
			cookie,
		);

		const result = await request(app)
			.get('/api/v1/product/products/category/')
			.send({ orderName: 'price', sorting: 'desc', exist: false })
			.query({ categoryId: category.body.categoryId });

		expect(result.body.result[1].id).toEqual(product1.body.product.id);
		expect(result.body.result[0].id).toEqual(product2.body.product.id);
		expect(result.body.result).toHaveLength(2);
	});

	it('get all product of category exist', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		const color = await insertColor('blue', '#123456', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product1.body.product.id, color.body.colorId, '0', cookie);

		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product2.body.product.id, color.body.colorId, '2', cookie);

		const category1 = await insertCategory('clothes', cookie);
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId, cookie);
		const field1 = await insertField('height', cookie);
		const brand1 = await insertBrand('adidas', cookie);
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId, cookie);
		const product3 = await insertProduct(
			'clothes1',
			'abcd',
			'150',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
			cookie,
		);

		const result = await request(app)
			.get('/api/v1/product/products/category/')
			.send({ orderName: 'price', sorting: 'desc', exist: true })
			.query({ categoryId: category.body.categoryId });

		expect(result.body.result[0].id).toEqual(product2.body.product.id);
		expect(result.body.result).toHaveLength(1);
	});

	it('search all product', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'this is name one',
			'this is description good',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const product2 = await insertProduct(
			'my name is ali and jafar',
			'my description is bad',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);

		const category1 = await insertCategory('clothes', cookie);
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId, cookie);
		const field1 = await insertField('height', cookie);
		const brand1 = await insertBrand('adidas', cookie);
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId, cookie);
		const product3 = await insertProduct(
			'my name is good clothes',
			'description is for test thats it',
			'152',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
			cookie,
		);

		const result = await request(app)
			.get('/api/v1/product/products/search/all')
			.send({ text: 'good', orderName: 'price', sorting: 'desc', exist: false });

		expect(result.body.result[0].id).toEqual(product3.body.product.id);
		expect(result.body.result[1].id).toEqual(product1.body.product.id);
		expect(result.body.result).toHaveLength(2);
	});

	it('search all product exist', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		const color = await insertColor('blue', '#123456', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'this is name one',
			'this is description good',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product1.body.product.id, color.body.colorId, '0', cookie);

		const product2 = await insertProduct(
			'my name is ali and jafar',
			'my description is bad',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product2.body.product.id, color.body.colorId, '2', cookie);

		const category1 = await insertCategory('clothes', cookie);
		const subCategory1 = await insertSubCategory('T-shirt', category1.body.categoryId, cookie);
		const field1 = await insertField('height', cookie);
		const brand1 = await insertBrand('adidas', cookie);
		await insertBrandToSubCategory(subCategory1.body.subCategoryId, brand1.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory1.body.subCategoryId, field1.body.fieldId, cookie);
		const product3 = await insertProduct(
			'my name is good clothes',
			'description is for test thats it',
			'152',
			subCategory1.body.subCategoryId,
			field1.body.fieldId,
			brand1.body.brandId,
			cookie,
		);

		const result = await request(app)
			.get('/api/v1/product/products/search/all')
			.send({ text: 'name', orderName: 'price', sorting: 'desc', exist: true });

		expect(result.body.result[0].id).toEqual(product2.body.product.id);
		expect(result.body.result).toHaveLength(1);
	});

	it('get all products Exist', async () => {
		const cookie = await signin();

		const category = await insertCategory('electronic', cookie);
		const subCategory = await insertSubCategory('laptop', category.body.categoryId, cookie);
		const field = await insertField('ram', cookie);
		const brand = await insertBrand('sony', cookie);
		const color = await insertColor('blue', '#123456', cookie);
		await insertBrandToSubCategory(subCategory.body.subCategoryId, brand.body.brandId, cookie);
		await insertFieldsSubCategory(subCategory.body.subCategoryId, field.body.fieldId, cookie);
		const product1 = await insertProduct(
			'name 1',
			'abcd',
			'150',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product1.body.product.id, color.body.colorId, '0', cookie);
		const product2 = await insertProduct(
			'name 2',
			'abcd',
			'151',
			subCategory.body.subCategoryId,
			field.body.fieldId,
			brand.body.brandId,
			cookie,
		);
		await insertColorToProduct(product2.body.product.id, color.body.colorId, '2', cookie);

		const result = await request(app)
			.get('/api/v1/product/products')
			.send({ orderName: 'price', sorting: 'desc', exist: true });

		expect(result.body.result[0].id).toEqual(product2.body.product.id);
	});
});
