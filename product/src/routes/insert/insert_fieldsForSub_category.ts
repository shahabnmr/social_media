import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';
import {
	Field,
	FieldsForSubCategory,
	SubCategoryService,
} from '../../services/db/psql/sub_category';

const router = express.Router();

router.post(
	'/api/v1/product/sub_category/add-fields',
	[
		body('subCategory_id').isString().isUUID().withMessage('invalid subCategory_id'),
		body('field_ids').isArray().withMessage('invalid field_ids'),
		body('field_ids.*').isUUID().withMessage('invalid field_ids'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const fieldsForSubCategory: FieldsForSubCategory = req.body;

		const subCategoryService = await SubCategoryService.getInstance();
		const result = await subCategoryService.insertFieldsForSubCategory(fieldsForSubCategory);

		res.status(201).send(result);
	},
);

export { router as insertFieldsForSubCategory };
