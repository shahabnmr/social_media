import express, { Request, Response } from 'express';
import { CategoryService } from '../../services/db/psql/category';

const router = express.Router();

router.get('/api/v1/product/categories/get-all', async (req: Request, res: Response) => {
	const categoryService = await CategoryService.getInstance();
	const result = await categoryService.findAll();
	res.status(200).send({ result });
});

export { router as getAllcategoriesRouter };
