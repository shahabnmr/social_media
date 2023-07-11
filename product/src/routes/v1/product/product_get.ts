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
		body('filterName')
			.isIn(['price', 'createddate'])
			.withMessage('filtername must be price or createddate'),
		body('sorting').isIn(['desc', 'asc']).withMessage('sorting must be desc or asc'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { filterName, sorting } = req.body;

		const productService = await ProductService.getInstance();
		const result = await productService.findAllProducts(filterName, sorting);
		res.status(200).send({ result });
	},
);

router.get(
	'/api/v1/product/products/sub_category/',
	[
		body('filterName')
			.isIn(['price', 'createddate'])
			.withMessage('filtername must be price or createddate'),
		body('sorting').isIn(['desc', 'asc']).withMessage('sorting must be desc or asc'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { filterName, sorting } = req.body;
		const subCategoryId = req.query.subCategoryId as string;

		const productService = await ProductService.getInstance();
		const result = await productService.findProductsOfSubCategory(
			subCategoryId,
			filterName,
			sorting,
		);
		res.status(200).send({ result });
	},
);

router.get(
	'/api/v1/product/products/category/',
	[
		body('filterName')
			.isIn(['price', 'createddate'])
			.withMessage('filtername must be price or createddate'),
		body('sorting').isIn(['desc', 'asc']).withMessage('sorting must be desc or asc'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { filterName, sorting } = req.body;
		const categoryId = req.query.categoryId as string;

		const productService = await ProductService.getInstance();
		const result = await productService.findProductsOfCategory(categoryId, filterName, sorting);

		res.status(200).send({ result });
	},
);

router.get('/api/v1/product/products/search/all', async (req: Request, res: Response) => {
	const { text } = req.body;
	const productService = await ProductService.getInstance();
	const result = await productService.searchAllProducts(text);

	res.status(200).send({ result });
});
export { router as getProductRouter };
