import express, { Request, Response } from 'express';
import { SubCategoryService } from '../../../services/db/psql/sub_category';
import { BadRequestError } from '@sn_common/common';

const router = express.Router();

router.get('/api/v1/product/sub_category/fields/query/', async (req: Request, res: Response) => {
	if (req.query.subCategoryId) {
		const subCategoryId = req.query.subCategoryId as string;
		if (subCategoryId.length > 36 || subCategoryId.length < 36)
			throw new BadRequestError('suc_category_id is invalid');
	}

	if (req.query.subCategoryName) {
		const subCategoryName = req.query.subCategoryName as string;
		if (subCategoryName.length > 15 || subCategoryName.length < 3)
			throw new BadRequestError('sub_category name is invalid');
	}
	const subCategoryService = await SubCategoryService.getInstance();
	const result = await subCategoryService.findFieldsOfSubCategory(
		req.query.subCategoryId as string,
		req.query.subCategoryName as string,
	);

	res.status(200).send({ result });
});

router.get('/api/v1/product/sub_category/all/fields/', async (req: Request, res: Response) => {
	const subCategoryService = await SubCategoryService.getInstance();
	const result = await subCategoryService.findFields();
	res.status(200).send({ result });
});

router.get(
	'/api/v1/product/get_sub_category/:categoryId/:name',
	async (req: Request, res: Response) => {
		const { categoryId, name } = req.params;
		const subCategoryService = await SubCategoryService.getInstance();
		const result = await subCategoryService.findSubCategoriesOfCategory(categoryId, name);

		res.status(200).send({ result });
	},
);

export { router as getSubCategoryRouter };
