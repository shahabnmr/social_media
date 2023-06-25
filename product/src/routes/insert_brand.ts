import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { Brand, BrandService } from '../services/db/psql/brand';
const router = express.Router();

router.post(
	'/api/v1/product/brand/insert/',
	[
		body('name').isString().not().isEmpty().withMessage('نام برند معتبر نمی باشد.'),
		body('description').isString().withMessage('توضیحات وارد شده صحیح نمی باشد.'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const brand: Brand = req.body;
		const brandService = await BrandService.getInstance();
		const brandExist = await brandService.findOne('', brand.name);
		if (brandExist) throw new BadRequestError('این نام برند قبلا ثبت شده است.');

		const result = await brandService.insert(brand);

		res.status(201).send({ result });
	},
);

export { router as insertBrandRouter };
