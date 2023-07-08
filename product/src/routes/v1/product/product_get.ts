import express, { Request, Response } from 'express';

import { ProductService } from '../../../services/db/psql/product';
import { BadRequestError } from '@sn_common/common';

const router = express.Router();

router.get('/api/v1/product/product/:productId', async (req: Request, res: Response) => {
	const { productId } = req.params;
	const productService = await ProductService.getInstance();
	if (productId.length != 36) throw new BadRequestError('productId is invalid');
	let result = await productService.findOneProductAllInfo(productId, '');

	res.status(200).send({ result });
});

router.get('/api/v1/product/products/', async (req: Request, res: Response) => {
	const productService = await ProductService.getInstance();
	const result = await productService.findAllProducts();
	res.status(200).send({ result });
});

router.get('/api/v1/product/products/sub_category/', async (req: Request, res: Response) => {
	const subCategoryId = req.query.subCategoryId as string;
	const productService = await ProductService.getInstance();
	const result = await productService.findProductsOfSubCategory(subCategoryId);
	res.status(200).send({ result });
});

export { router as getProductRouter };
