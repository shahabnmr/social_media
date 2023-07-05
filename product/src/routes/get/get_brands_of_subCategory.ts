import express, { Request, Response } from 'express';
import { BrandService } from '../../services/db/psql/brand';

const router = express.Router();

router.get('/api/v1/product/brands/:subCategoryId', async (req: Request, res: Response) => {
	const brandService = await BrandService.getInstance();
	const result = await brandService.findBrandsInSubCategory(req.params.subCategoryId);
	res.status(200).send({ result });
});

export { router as getBrandsOfSubCategoryRouter };
