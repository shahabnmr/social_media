import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@sn_common/common';

import { Brand, BrandService } from '../../../services/db/psql/brand';
import { SubCategoryService } from '../../../services/db/psql/sub_category';
import { isAdmin } from '../../../function/isAdmin';
const router = express.Router();

router.post('/api/v1/product/brand/insert/to_sub_category/', requireAuth, [
	body('sub_category_id').isUUID().withMessage('sub_category_id is not valid'),
	body('brands').isUUID().withMessage('brand ids in not valid'),
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const { sub_category_id, brands } = req.body;

		const brandService = await BrandService.getInstance();
		const sub_categoryService = await SubCategoryService.getInstance();

		const sub_category = await sub_categoryService.findOne(sub_category_id, '');
		if (!sub_category) throw new BadRequestError('this sub_category_id not exist');

		const brand = await brandService.checkBrands(brands);
		if (brand == 'one or many of brands is missing')
			throw new BadRequestError('one of brand id not exist');

		await brandService.insertBrandstoSubCategory(sub_category_id, brands);

		res.status(201).send({ message: 'brands is inserted' });
	},
]);

router.post(
	'/api/v1/product/brand/insert/',
	requireAuth,
	[
		body('name').isString().not().isEmpty().withMessage('name is not valid'),
		body('description').isString().withMessage('description is not valid'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		await isAdmin(req.currentUser!.email);

		const brand: Brand = req.body;
		const brandService = await BrandService.getInstance();
		const brandExist = await brandService.findOne('', brand.name);
		if (brandExist) throw new BadRequestError('this brand name already exist.');

		const result = await brandService.insert(brand);

		res.status(201).send({ brandId: result });
	},
);

export { router as postBrandRouter };
