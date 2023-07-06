import jwt from 'jsonwebtoken';
import { app } from '../app';
import request from 'supertest';
import Dbservice from '../services/db/common/postgres/db.service';
import { ProductService } from '../services/db/psql/product';
import { BrandService } from '../services/db/psql/brand';
import { CategoryService } from '../services/db/psql/category';
import { ColorService } from '../services/db/psql/color';
import { SubCategoryService } from '../services/db/psql/sub_category';

jest.mock('../nats-wrapper');
jest.setTimeout(601999);
let category: any;
let color: any;
let subCategory: any;
let product: any;
let brand: any;

beforeAll(async () => {
	brand = await BrandService.getInstance();
	category = await CategoryService.getInstance();
	color = await ColorService.getInstance();
	subCategory = await SubCategoryService.getInstance();
	product = await ProductService.getInstance();

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
});

export const insertCategory = async (name: string) => {
	return await request(app)
		.post('/api/v1/product/category/')
		.send({
			name,
		})
		.expect(201);
};

export const insertSubCategory = async (nameSubCategory: string, nameCategory: string) => {
	const category = await insertCategory(nameCategory);

	return await request(app)
		.post('/api/v1/product/sub_category')
		.send({
			name: nameSubCategory,
			category_id: category.body.category,
		})
		.expect(201);
};

export const insertBrand = async (brandName: string) => {
	return await request(app)
		.post('/api/v1/product/brand/insert/')
		.send({
			name: brandName,
			description: 'this is sony brand',
		})
		.expect(201);
};

export const insertField = async (nameField: string) => {
	return await request(app)
		.post('/api/v1/product/sub_category/field')
		.send({
			name: nameField,
			type: 'text',
			metadata: '',
		})
		.expect(201);
};

export const insertColor = async (nameColor: string, codeColor: string) => {
	return await request(app)
		.post('/api/v1/product/color')
		.send({
			name: nameColor,
			code_color: codeColor,
		})
		.expect(201);
};

export const insertFieldsSubCategory = async () => {
	const field = await insertField('ram');
	const subCategory = await insertSubCategory('laptop', 'electronics');
	await request(app)
		.post('/api/v1/product/sub_category/add-fields')
		.send({
			subCategory_id: subCategory.body.subCategoryId,
			field_ids: [field.body.fieldId],
		})
		.expect(201);
	return { subCategory, field };
};

export const insertProduct = async (
	name: string,
	fieldId: string,
	brandId: string,
	subCategoryId: string,
) => {
	let field: any;
	if (!fieldId) {
		field = await insertFieldsSubCategory();
		fieldId = field.field.body.fieldId;
		subCategoryId = field.subCategory.body.subCategoryId;
	}
	if (!brandId) {
		const brand = await insertBrand('sony');
		await request(app)
			.post('/api/v1/product/brand/insert/to_sub_category/')
			.send({
				sub_category_id: field!.subCategory.body.subCategoryId,
				brands: [brand.body.result],
			})
			.expect(201);

		brandId = brand.body.result;
	}

	return await request(app)
		.post('/api/v1/product/')
		.send({
			name,
			description: 'this is a good laptop',
			price: '155',
			sub_category_id: subCategoryId,
			fields: [{ fieldId: fieldId, value: '256' }],
			brandId: brandId,
		});
};

export const insertBrandToSubCategory = async () => {
	const subCategory = await insertSubCategory('laptop', 'electronics');

	const brand = await insertBrand('sony');

	await request(app)
		.post('/api/v1/product/brand/insert/to_sub_category/')
		.send({
			sub_category_id: subCategory.body.subCategoryId,
			brands: [brand.body.result],
		})
		.expect(201);

	return subCategory.body.subCategoryId;
};

// export const signin = async () => {
// const userService = await UserService.getInstance();

// const email = 'test@test.com';

// const res = await request(app)
// 	.post('/api/v1/auth/signup')
// 	.send({
// 		name: 'shahab',
// 		family: 'asd',
// 		tell: '01234567891',
// 		email,
// 		password: '123qwe',
// 		confirmPassword: '123qwe',
// 	})
// 	.expect(201);

// const details = res.get('Set-Cookie');

// const user = await userService.findOne(email, '', '');
// const otp = await userService.findOneOtp('', user.id);

// const res2 = await request(app)
// 	.post('/api/v1/auth/verify')
// 	.set('Cookie', details)
// 	.send({
// 		otp: otp.otp,
// 	})
// 	.expect(200);
// expect(res2.body.user).toBeDefined();

// const cookie = res2.get('Set-Cookie');

// return { cookie, details };
// };
