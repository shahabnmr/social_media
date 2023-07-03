import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@sn_common/common';
import { Field, SubCategoryService } from '../../services/db/psql/sub_category';

const router = express.Router();

router.post(
	'/api/v1/product/sub_category/field',
	[
		body('name')
			.isString()
			.isLength({ min: 3, max: 15 })
			.withMessage('نام باید حداقل ۳ و حداکثر ۱۵ حروف داشته باشد'),
		body('type')
			.isString()
			.isLength({ min: 3, max: 15 })
			.withMessage('تایپ باید بین ۳ تا ۱۵ حروف باشد.'),
		body('metadata').isString(),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const field: Field = req.body;

		const subCategoryService = await SubCategoryService.getInstance();
		const fieldNameExist = await subCategoryService.findOneField('', field.name);
		if (fieldNameExist) throw new BadRequestError('این نام فیلد قبلا ثبت شده است');

		const result = await subCategoryService.insertField(field);
		res.status(201).send({ fieldId: result });
	},
);

export { router as insertFieldRouter };
