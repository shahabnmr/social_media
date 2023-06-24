import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { CategoryService } from '../services/db/psql/category';

const router = express.Router();

router.post(
	'/api/v1/product/category/',
	[body('name').isString().isLength({ max: 20, min: 4 })],
	validateRequest,
	async (req: Request, res: Response) => {
		const { name } = req.body;
		const categoryService = await CategoryService.getInstance();

		const category = await categoryService.findOne('', name);
		if (category) throw new BadRequestError(`this category name already exist: ${name}`);

		const result = await categoryService.insert(name);
		res.status(200).send({ category: result });
	},
);

export { router as insertCategoryRouter };
