import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { ColorService } from '../services/db/psql/color';
const router = express.Router();

router.post(
	'/api/v1/product/color',
	[
		body('name').isString().isLength({ max: 12, min: 3 }).withMessage('name is not valid'),
		body('code_color')
			.isString()
			.isLength({ max: 7, min: 7 })
			.withMessage('code_color is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
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

export { router as insertColorRouter };
