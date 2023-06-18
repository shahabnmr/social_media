import express, { Request, Response } from 'express';

import { ProductService } from '../services/db/psql/product';

const router = express.Router();

router.get('/api/v1/product/:productId', async (req: Request, res: Response) => {
	const { productId } = req.params;
	const productService = await ProductService.getInstance();

	let result = await productService.findOneProductAllInfo(productId, '');

	res.status(200).send({ result });
});

export { router as getProductRouter };
