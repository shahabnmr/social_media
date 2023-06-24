import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { Product, ProductService } from '../services/db/psql/product';

const router = express.Router();

router.post(
	'/api/v1/product/',
	[
		body('name').isString().isLength({ min: 5, max: 25 }).withMessage('name is not valid'),
		body('description').isString().withMessage('description is not valid'),
		body('images').isArray().withMessage('images is not valid'),
		body('price').isString().isLength({ max: 10, min: 1 }).withMessage('price is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const product: Product = req.body;
		const productService = await ProductService.getInstance();

		const productExist = await productService.findOneProduct('', product.name);
		if (productExist) throw new BadRequestError(`this product name already exist: ${product.name}`);

		const result = await productService.insertProduct(product);
		res.status(201).send({ productId: result });
	},
);

export { router as insertProductRouter };
