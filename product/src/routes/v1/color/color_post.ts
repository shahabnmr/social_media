import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@sn_common/common';

import { ColorOfProduct, ColorService } from '../../../services/db/psql/color';
import { ProductService } from '../../../services/db/psql/product';
import { isAdmin } from '../../../function/isAdmin';
const router = express.Router();

router.post(
	'/api/v1/product/color',
	requireAuth,
	[
		body('name').isString().isLength({ max: 12, min: 3 }).withMessage('name is not valid'),
		body('code_color')
			.isString()
			.isLength({ max: 7, min: 7 })
			.withMessage('code_color is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const { name, code_color } = req.body;
		const colorService = await ColorService.getInstance();

		const color = await colorService.findOne('', name, code_color);
		if (color)
			throw new BadRequestError(
				`this color name(${name}) or code_color(${code_color}) already exist`,
			);

		const result = await colorService.insert(name, code_color);

		res.status(201).send({ colorId: result });
	},
);

router.post(
	'/api/v1/product/color_of_product/',
	requireAuth,
	[body('color_id').isString(), body('product_id').isString(), body('amount').isNumeric()],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const colorProduct: ColorOfProduct = req.body;
		const colorService = await ColorService.getInstance();

		const color = await colorService.findOne(colorProduct.color_id, '', '');
		if (!color) throw new BadRequestError(`this colorId not exist: ${colorProduct.color_id}`);

		const productService = await ProductService.getInstance();
		const product = await productService.findOneProduct(colorProduct.product_id, '');
		if (!product) throw new BadRequestError(`this product not exist: ${colorProduct.product_id}`);

		const result = await colorService.colorOfProduct(colorProduct);

		res.status(201).send({ message: 'insert successful', id: result });
	},
);

export { router as postColorRouter };
