import express, { Request, Response } from 'express';
import { SubCategoryService } from '../services/db/psql/sub_category';

const router = express.Router();

router.get('/api/v1/product/sub_category/all/fields/', async (req: Request, res: Response) => {
	const subCategoryService = await SubCategoryService.getInstance();
	const result = await subCategoryService.findFields();
	res.status(200).send({ result });
});

export { router as getFieldsRouter };
