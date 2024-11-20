import jwt from 'jsonwebtoken';
import { app } from '../app';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { ProductService } from '../services/db/psql/product';
import { BrandService } from '../services/db/psql/brand';
import { CategoryService } from '../services/db/psql/category';
import { ColorService } from '../services/db/psql/color';
import { SubCategoryService } from '../services/db/psql/sub_category';
import { UserService } from '../services/db/psql/user';

jest.mock('../nats-wrapper');
jest.setTimeout(601999);
let category: any;
let color: any;
let subCategory: any;
let product: any;
let brand: any;
let user: any;

beforeAll(async () => {
	brand = await BrandService.getInstance();
	category = await CategoryService.getInstance();
	color = await ColorService.getInstance();
	subCategory = await SubCategoryService.getInstance();
	product = await ProductService.getInstance();
	user = await UserService.getInstance();

	process.env.TZ = 'EST';
	process.env.NATS_CLIENT_ID = 'dsadasdasas';
	process.env.NATS_URL = 'string';
	process.env.NATS_CLUSTER_ID = 'string';
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
});

beforeEach(async () => {
	await product.deleteAllContent();

	jest.clearAllMocks();
});

afterAll(async () => {
	await product.end();
	await brand.end();
	await category.end();
	await color.end();
	await subCategory.end();
	await user.end();
});

export const insertCategory = async (name: string, cookie: string[]) => {
	return await request(app)
		.post('/api/v1/product/category/')
		.set('Cookie', cookie)
		.send({
			name,
		})
		.expect(201);
};

export const insertSubCategory = async (
	nameSubCategory: string,
	categoryId: string,
	cookie: string[],
) => {
	return await request(app)
		.post('/api/v1/product/sub_category')
		.set('Cookie', cookie)
		.send({
			name: nameSubCategory,
			category_id: categoryId,
		})
		.expect(201);
};

export const insertBrand = async (brandName: string, cookie: string[]) => {
	return await request(app)
		.post('/api/v1/product/brand/insert/')
		.set('Cookie', cookie)
		.send({
			name: brandName,
			description: 'this is sony brand',
		})
		.expect(201);
};

export const insertField = async (nameField: string, cookie: string[]) => {
	return await request(app)
		.post('/api/v1/product/sub_category/field')
		.set('Cookie', cookie)
		.send({
			name: nameField,
			type: 'text',
			metadata: '',
		})
		.expect(201);
};

export const insertColor = async (nameColor: string, codeColor: string, cookie: string[]) => {
	return await request(app)
		.post('/api/v1/product/color')
		.set('Cookie', cookie)
		.send({
			name: nameColor,
			code_color: codeColor,
		})
		.expect(201);
};

export const insertFieldsSubCategory = async (
	subCategoryId: string,
	fieldId: string,
	cookie: string[],
) => {
	return await request(app)
		.post('/api/v1/product/sub_category/add-fields')
		.set('Cookie', cookie)
		.send({
			subCategory_id: subCategoryId,
			field_ids: [fieldId],
		})
		.expect(201);
};

export const insertProduct = async (
	name: string,
	description: string,
	price: string,
	subCategoryId: string,
	fieldId: string,
	brandId: string,
	cookie: string[],
) => {
	return await request(app)
		.post('/api/v1/product/')
		.set('Cookie', cookie)
		.send({
			name,
			description: description,
			price: price,
			sub_category_id: subCategoryId,
			fields: [{ fieldId: fieldId, value: '256' }],
			brandId: brandId,
		});
};

export const insertBrandToSubCategory = async (
	subCategoryId: string,
	brandId: string,
	cookie: string[],
) => {
	return await request(app)
		.post('/api/v1/product/brand/insert/to_sub_category/')
		.set('Cookie', cookie)
		.send({
			sub_category_id: subCategoryId,
			brands: [brandId],
		})
		.expect(201);
};

export const insertColorToProduct = async (
	productId: string,
	colorId: string,
	amount: string,
	cookie: string[],
) => {
	const result = await request(app)
		.post('/api/v1/product/color_of_product/')
		.set('Cookie', cookie)
		.send({
			product_id: productId,
			color_id: colorId,
			amount: amount,
		});
	return result;
};

export const signin = async () => {
	const email = 'test@test.com';
	const version = 1;
	const roll = 'admin';
	const id_ = uuidv4();
	await user.insert({ id: id_, version: 0, status: true, roll: 'admin', email: 'test@test.com' });
	await user.updateRoll(email, roll, version);
	const payload = {
		id: id_,
		email: 'test@test.com',
		tell: '12345678901',
	};

	const token = jwt.sign(payload, process.env.JWT_KEY!);

	const session = { jwt: token };

	const sessionJSON = JSON.stringify(session);

	const base64 = Buffer.from(sessionJSON).toString('base64');

	return [`session=${base64}`];
};
