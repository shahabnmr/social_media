import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { Product, ProductService } from '../services/db/psql/product';
import { SubCategoryService } from '../services/db/psql/sub_category';

const router = express.Router();

router.post(
	'/api/v1/product/',
	[
		body('name').isString().isLength({ min: 5, max: 25 }).withMessage('name is not valid'),
		body('description').isString().withMessage('description is not valid'),
		body('images').isArray().withMessage('images is not valid'),
		body('price').isString().isLength({ max: 10, min: 1 }).withMessage('price is not valid'),
		body('sub_category_id').isUUID().withMessage('sub_category_id is not valid'),
		body('fields.*.fieldId')
			.isUUID()
			.withMessage('fields.fieldId is not valid')
			.not()
			.isEmpty()
			.withMessage('fields.fieldId is not valid'),
		body('fields.*.value')
			.isString()
			.withMessage('fields.value is not valid')
			.not()
			.isEmpty()
			.withMessage('fields.fieldId is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		let product: Product = req.body;
		const productService = await ProductService.getInstance();
		const subCategoryService = await SubCategoryService.getInstance();

		const lengthOfFields = product.fields.length;
		let fields = JSON.stringify(product.fields);
		const checkFieldsOfSubCategory = await subCategoryService.checkFieldsOfSubCategory(
			product.sub_category_id,
			fields,
		);
		if (checkFieldsOfSubCategory.length !== lengthOfFields)
			throw new BadRequestError('one or many of fields is not for this sub_category');

		const fieldOfSubCategory = await subCategoryService.findFieldsOfSubCategory(
			product.sub_category_id,
			'',
		);

		fieldOfSubCategory.map((field) => {
			console.log(field);

			if (!fields.includes(field.id!))
				throw new BadRequestError(`this field must be provide id:${field.id}, name:${field.name}`);
		});

		const productExist = await productService.findOneProduct('', product.name);
		if (productExist) throw new BadRequestError(`this product name already exist: ${product.name}`);

		const subCategory = await subCategoryService.findOne(product.sub_category_id, '');
		if (!subCategory) throw new BadRequestError('sub_category_id not find');

		product.id = await productService.insertProduct(product);

		await productService.insertValuesOfFields(product);

		res.status(201).send({ product });
	},
);

export { router as insertProductRouter };
