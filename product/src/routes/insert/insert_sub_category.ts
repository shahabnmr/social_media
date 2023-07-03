import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { SubCategory, SubCategoryService } from '../../services/db/psql/sub_category';
import { CategoryService } from '../../services/db/psql/category';
const router = express.Router();

router.post(
	'/api/v1/product/sub_category',
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
		const subCategory: SubCategory = req.body;

		const subCategoryService = await SubCategoryService.getInstance();
		const categoryService = await CategoryService.getInstance();
		const category = await categoryService.findOne(subCategory.category_id, '');
		if (!category) throw new BadRequestError('this category id not exist');

		const subCategoryExist = await subCategoryService.findOne('', subCategory.name);
		if (subCategoryExist) throw new BadRequestError('این نام زیرگروه قبلا ثبت شده است.');

		const result = await subCategoryService.insert(subCategory);

		res.status(201).send({ subCategoryId: result });
	},
);

export { router as insertSubCategoryRouter };
