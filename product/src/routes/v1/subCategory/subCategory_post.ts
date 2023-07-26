import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@sn_common/common';
import {
	Field,
	FieldsForSubCategory,
	SubCategory,
	SubCategoryService,
} from '../../../services/db/psql/sub_category';
import { CategoryService } from '../../../services/db/psql/category';
import { isAdmin } from '../../../function/isAdmin';

const router = express.Router();

router.post(
	'/api/v1/product/sub_category/field',
	requireAuth,
	[
		body('name').isString().isLength({ min: 3, max: 15 }).withMessage('name is invalid'),
		body('type').isString().isLength({ min: 3, max: 15 }).withMessage('type is invalid'),
		body('metadata').isString(),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const field: Field = req.body;

		const subCategoryService = await SubCategoryService.getInstance();
		const fieldNameExist = await subCategoryService.findOneField('', field.name);
		if (fieldNameExist) throw new BadRequestError('name already exist.');

		const result = await subCategoryService.insertField(field);
		res.status(201).send({ fieldId: result });
	},
);

router.post(
	'/api/v1/product/sub_category/add-fields',
	requireAuth,
	[
		body('subCategory_id').isString().isUUID().withMessage('invalid subCategory_id'),
		body('field_ids').isArray().withMessage('invalid field_ids'),
		body('field_ids.*').isUUID().withMessage('invalid field_ids'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);
		const fieldsForSubCategory: FieldsForSubCategory = req.body;

		const subCategoryService = await SubCategoryService.getInstance();
		const result = await subCategoryService.insertFieldsForSubCategory(fieldsForSubCategory);

		res.status(201).send(result);
	},
);

router.post(
	'/api/v1/product/sub_category',
	requireAuth,
	[
		body('name')
			.isString()
			.isLength({ min: 3, max: 15 })
			.withMessage('name have to be between 3 and 15 charecter'),
		body('category_id')
			.isString()
			.isLength({ min: 36, max: 36 })
			.withMessage('category_id is invalid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);
		const subCategory: SubCategory = req.body;

		const subCategoryService = await SubCategoryService.getInstance();
		const categoryService = await CategoryService.getInstance();
		const category = await categoryService.findOne(subCategory.category_id, '');
		if (!category) throw new BadRequestError('this category id not exist');

		const subCategoryExist = await subCategoryService.findOne('', subCategory.name);
		if (subCategoryExist) throw new BadRequestError('subCategory name already exist.');

		const result = await subCategoryService.insert(subCategory);

		res.status(201).send({ subCategoryId: result });
	},
);

export { router as postSubCategoryRouter };
