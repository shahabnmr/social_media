import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { ProductService } from '../../../services/db/psql/product';

const router = express.Router();

router.get('/api/v1/product/product/:productId', async (req: Request, res: Response) => {
	const { productId } = req.params;
	const productService = await ProductService.getInstance();
	if (productId.length != 36) throw new BadRequestError('productId is invalid');
	let result = await productService.findOneProductAllInfo(productId, '');

	res.status(200).send({ result });
});

router.get(
	'/api/v1/product/products/',
	[
		body('orderName')
			.isIn(['price', 'createddate'])
			.withMessage('orderName must be price or createddate'),
		body('sorting').isIn(['desc', 'asc']).withMessage('sorting must be desc or asc'),
		body('exist').isBoolean().withMessage('exist is a boolean'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { orderName, sorting, exist } = req.body;

		const productService = await ProductService.getInstance();
		const result = await productService.findAllProducts(orderName, sorting, exist);
		res.status(200).send({ result });
	},
);

router.get(
	'/api/v1/product/products/sub_category/',
	[
		body('orderName')
			.isIn(['price', 'createddate'])
			.withMessage('orderName must be price or createddate'),
		body('sorting').isIn(['desc', 'asc']).withMessage('sorting must be desc or asc'),
		body('exist').isBoolean().withMessage('exist is a boolean'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { orderName, sorting, exist } = req.body;
		const subCategoryId = req.query.subCategoryId as string;

		const productService = await ProductService.getInstance();
		const result = await productService.findProductsOfSubCategory(
			subCategoryId,
			orderName,
			sorting,
			exist,
		);
		res.status(200).send({ result });
	},
);

router.get(
	'/api/v1/product/products/category/',
	[
		body('orderName')
			.isIn(['price', 'createddate'])
			.withMessage('orderName must be price or createddate'),
		body('sorting').isIn(['desc', 'asc']).withMessage('sorting must be desc or asc'),
		body('exist').isBoolean().withMessage('exist is a boolean'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { orderName, sorting, exist } = req.body;
		const categoryId = req.query.categoryId as string;

		const productService = await ProductService.getInstance();
		const result = await productService.findProductsOfCategory(
			categoryId,
			orderName,
			sorting,
			exist,
		);

		res.status(200).send({ result });
	},
);

router.get(
	'/api/v1/product/products/search/all',
	[
		body('orderName')
			.isIn(['price', 'createddate', 'rank'])
			.withMessage('orderName must be price or createddate'),
		body('sorting').isIn(['desc', 'asc']).withMessage('sorting must be desc or asc'),
		body('exist').isBoolean().withMessage('exist is a boolean'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { text, orderName, sorting, exist } = req.body;
		const productService = await ProductService.getInstance();
		const result = await productService.searchAllProducts(text, orderName, sorting, exist);

		res.status(200).send({ result });
	},
);
export { router as getProductRouter };
