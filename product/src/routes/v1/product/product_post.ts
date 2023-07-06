import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { Product, ProductService } from '../../../services/db/psql/product';
import { SubCategoryService } from '../../../services/db/psql/sub_category';
import { BrandService } from '../../../services/db/psql/brand';

const router = express.Router();

router.post(
	'/api/v1/product/',
	[
		body('name').isString().isLength({ min: 5, max: 30 }).withMessage('name is not valid'),
		body('description').isString().withMessage('description is not valid'),
		body('price').isString().isLength({ max: 10, min: 1 }).withMessage('price is not valid'),
		body('sub_category_id').isUUID().withMessage('sub_category_id is not valid'),
		body('fields').isArray().withMessage('fields is not valid'),
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
			.withMessage('fields.value is not valid'),
		body('brandId').isUUID().withMessage('brandId is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		let product: Product = req.body;

		if (req.files)
			product.images = (req.files as Array<Express.Multer.File>).map((image) => {
				return image.filename;
			});

		const productService = await ProductService.getInstance();
		const subCategoryService = await SubCategoryService.getInstance();
		const brandService = await BrandService.getInstance();

		const brand = await brandService.findOneBrandInSubCategory(
			product.sub_category_id,
			product.brandId,
		);

		if (!brand) throw new BadRequestError('this subCategory not have this brand');

		let fields = JSON.stringify(product.fields);
		const checkFieldsOfSubCategory = await subCategoryService.checkFieldsOfSubCategory(
			product.sub_category_id,
			fields,
		);

		const fieldOfSubCategory = await subCategoryService.findFieldsOfSubCategory(
			product.sub_category_id,
			'',
		);

		fieldOfSubCategory.map((field) => {
			if (!fields.includes(field.id!))
				throw new BadRequestError(`this field must be provide id:${field.id}, name:${field.name}`);
		});

		const productExist = await productService.findOneProduct('', product.name);
		if (productExist) throw new BadRequestError(`this product name already exist: ${product.name}`);

		// const subCategory = await subCategoryService.findOne(product.sub_category_id, '');
		// if (!subCategory) throw new BadRequestError('sub_category_id not find');

		product.id = await productService.insertProduct(product);

		await productService.insertValuesOfFields(product);

		res.status(201).send({ product });
	},
);

export { router as postProductRouter };
