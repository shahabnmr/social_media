import express, { Request, Response } from 'express';
import { ColorService } from '../../../services/db/psql/color';
import { BadRequestError, requireAuth, validateRequest } from '@sn_common/common';
import { body } from 'express-validator';
import { isAdmin } from '../../../function/isAdmin';
import { ProductColorDeletedPublisher } from '../../../events/publishers/product-color-deleted-publisher';
import { natsWrapper } from '../../../nats-wrapper';
import { ProductService } from '../../../services/db/psql/product';

const router = express.Router();
router.delete(
	'/api/v1/product/colors/delete',
	requireAuth,
	[body('color_id').isString().isLength({ max: 36, min: 16 }).withMessage('color_id is not valid')],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const colorService = await ColorService.getInstance();

		const color = await colorService.findOne(req.body.color_id, '', '');
		if (!color) throw new BadRequestError(`this colorId not exist: ${req.body.color_id}`);

		const colorExistForProduct = await colorService.findProductsOfColors(
			req.body.color_id as string,
		);
		if (colorExistForProduct.length > 0) {
			throw new BadRequestError(
				`this Product: ${colorExistForProduct[0].product_id} has this color: ${colorExistForProduct[0].color_id}, first delete color for this product.`,
			);
		}
		const result = await colorService.delete(req.body.color_id);

		res.status(200).send({ deleted: result });
	},
);

router.delete(
	'/api/v1/product/colors/product_color/delete',
	requireAuth,
	[
		body('product_color_id')
			.isString()
			.isLength({ max: 36, min: 16 })
			.withMessage('product_color_id is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const colorService = await ColorService.getInstance();
		const productService = await ProductService.getInstance();

		const productColor = await colorService.findProduct_color(req.body.product_color_id);
		if (productColor.length <= 0) {
			throw new BadRequestError('Not Exist productColorId.');
		}

		const result = await colorService.delete_product_color(req.body.product_color_id);

		// const product = await productService.findOneProduct(productColor[0].product_id, '');
		// if (!product) {
		// 	throw new BadRequestError(' product not Found!');
		// }

		// const version = await productService.updateVersion(product.id!);

		if (result)
			await new ProductColorDeletedPublisher(natsWrapper.client).publish({
				id: productColor[0].product_id,
				version: productColor[0].version + 1,
			});

		res.status(200).send({ deleted: result });
	},
);

export { router as deleteColorRouter };
