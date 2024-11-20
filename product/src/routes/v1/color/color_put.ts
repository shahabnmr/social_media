import express, { Request, Response } from 'express';
import { ColorService } from '../../../services/db/psql/color';
import { BadRequestError, requireAuth, validateRequest } from '@sn_common/common';
import { body } from 'express-validator';
import { isAdmin } from '../../../function/isAdmin';

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

export { router as updateColorRouter };
