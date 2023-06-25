import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';

import { Brand, BrandService } from '../services/db/psql/brand';
import { SubCategoryService } from '../services/db/psql/sub_category';
const router = express.Router();

router.post('/api/v1/product/brand/insert/to_sub_category/', [
	body('sub_category_id').isUUID().withMessage('آیدی زیرگروه معتبر نمیباشد'),
	body('brands').isUUID().withMessage('آیدی برند معتبر نمیباشد.'),
	validateRequest,
	async (req: Request, res: Response) => {
		const { sub_category_id, brands } = req.body;

		const brandService = await BrandService.getInstance();
		const sub_categoryService = await SubCategoryService.getInstance();

		const sub_category = await sub_categoryService.findOne(sub_category_id, '');
		if (!sub_category) throw new BadRequestError('this sub_category_id not exist');

		const brand = await brandService.checkBrands(brands);
		if (brand == 'one or many of brands is missing') throw new BadRequestError('one of brand id not exist');

		await brandService.insertBrandstoSubCategory(sub_category_id, brands);

		res.status(201).send({ message: 'brands is inserted' });
	},
]);

export { router as insertBrandstoSubCategoryRouter };
