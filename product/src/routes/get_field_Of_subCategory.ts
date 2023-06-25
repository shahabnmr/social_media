import express, { Request, Response } from 'express';
import { SubCategoryService } from '../services/db/psql/sub_category';
import { BadRequestError } from '@sn_common/common';

const router = express.Router();

router.get('/api/v1/product/sub_category/fields/query/', async (req: Request, res: Response) => {
	if (req.query.subCategoryId) {
		const subCategoryId = req.query.subCategoryId as string;
		if (subCategoryId.length > 36 || subCategoryId.length < 36)
			throw new BadRequestError('آیدی زیرگروه معتبر نمیباشد.');
	}

	if (req.query.subCategoryName) {
		const subCategoryName = req.query.subCategoryName as string;
		if (subCategoryName.length > 15 || subCategoryName.length < 3)
			throw new BadRequestError('نام دسته بندی معتبر نمی باشد.');
	}
	const subCategoryService = await SubCategoryService.getInstance();
	const result = await subCategoryService.findFieldsOfSubCategory(
		req.query.subCategoryId as string,
		req.query.subCategoryName as string,
	);

	res.status(200).send({ result });
});
export { router as getFieldsOfSubCategoryRouter };
