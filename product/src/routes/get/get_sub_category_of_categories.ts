import express, { Request, Response } from 'express';
import { SubCategoryService } from '../../services/db/psql/sub_category';

const router = express.Router();

router.get(
	'/api/v1/product/sub_category/:categoryId/:name',
	async (req: Request, res: Response) => {
		const { categoryId, name } = req.params;
		const subCategoryService = await SubCategoryService.getInstance();
		const result = await subCategoryService.findSubCategoriesOfCategory(categoryId, name);

		res.status(200).send({ result });
	},
);

export { router as getSubCategoriesOfCategory };
