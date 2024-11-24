import express, { Request, Response } from 'express';
import { Color, ColorOfProduct, ColorService } from '../../../services/db/psql/color';
import { BadRequestError, NotFoundError, requireAuth, validateRequest } from '@sn_common/common';
import { body } from 'express-validator';
import { isAdmin } from '../../../function/isAdmin';
import { ProductService } from '../../../services/db/psql/product';

const router = express.Router();
router.put(
	'/api/v1/product/colors/put',
	requireAuth,
	[
		body('id').isString().isLength({ max: 36, min: 16 }).withMessage('color_id is not valid'),
		body('name').isString().isLength({ max: 50, min: 2 }).withMessage('name is not valid.'),
		body('code_color')
			.isString()
			.isLength({ max: 10, min: 2 })
			.withMessage('code_color is not valid.'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const colorService = await ColorService.getInstance();

		const color = await colorService.findOne(req.body.id, '', '');
		if (!color) throw new BadRequestError(`this colorId not exist: ${req.body.color_id}`);

		const result = await colorService.update(req.body.id, req.body.name, req.body.code_color);

		res.status(200).send({ updated: result });
	},
);

router.put(
	'/api/v1/product/colors/product_color/put',
	requireAuth,
	[
		body('id')
			.isString()
			.not()
			.isEmpty()
			.isLength({ max: 36, min: 16 })
			.withMessage('id is not valid'),
		body('color_id')
			.isString()
			.not()
			.isEmpty()
			.isLength({ max: 36, min: 16 })
			.withMessage('color_id is not valid'),
		body('product_id')
			.isString()
			.isLength({ max: 36, min: 16 })
			.not()
			.isEmpty()
			.withMessage('product_id is not valid'),
		body('amount').isNumeric().isLength({ max: 3, min: 1 }).withMessage('amount is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const colorProduct: ColorOfProduct = req.body;
		const colorService = await ColorService.getInstance();
		const productService = await ProductService.getInstance();

		const checkColorProduct = await colorService.findProduct_color(colorProduct.id!);
		if (!checkColorProduct) {
			throw new NotFoundError();
		}

		let color: Color;
		if (colorProduct.color_id) {
			const color = await colorService.findOne(colorProduct.color_id, '', '');
			if (!color) throw new BadRequestError(`this colorId not exist: ${req.body.color_id}`);
		}

		const product = await productService.findOneProduct(colorProduct.product_id, '');
		if (!product) throw new BadRequestError(`this product not exist: ${colorProduct.product_id}`);

		const result = await colorService.update_product_color(
			colorProduct.id!,
			colorProduct.color_id,
			colorProduct.product_id,
			colorProduct.amount,
		);

		res.status(200).send({ updated: result });
	},
);

export { router as updateColorRouter };
