import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@sn_common/common';
import { rateLimit } from 'express-rate-limit';

import Dbservice from './services/db/common/postgres/db.service';
import { insertCategoryRouter } from './routes/insert_category';
import { insertColorRouter } from './routes/insert_color';
import { insertProductRouter } from './routes/insert_product';
import { colorOfProductRouter } from './routes/insert_product_color';
import { getProductRouter } from './routes/get_product';
import { insertSubCategoryRouter } from './routes/insert_sub_category';
import { getSubCategoriesOfCategory } from './routes/get_sub_category_of_categories';
import { insertFieldRouter } from './routes/insert_field';
import { getFieldsRouter } from './routes/get_fields';
import { insertFieldsForSubCategory } from './routes/insert_fieldsForSub_category';
import { getFieldsOfSubCategoryRouter } from './routes/get_field_Of_subCategory';
import { insertBrandRouter } from './routes/insert_brand';
import { getBrandsRouter } from './routes/get_brands';
import { insertBrandstoSubCategoryRouter } from './routes/insert_brand_to_subCategory';

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	message: 'too many request from this IP, pls try again after in a few minutes ',
});
// app.set('trust proxy', true);
app.use(json());
app.use(cors());
app.use(
	cookieSession({
		name: 'session',
		signed: false,
		// secure: process.env.NODE_ENV !== 'test',
	}),
);
app.use(limiter);

const connections = async () => {
	await Dbservice.getInstance();
};
connections();

app.use(insertCategoryRouter);
app.use(insertColorRouter);
app.use(insertProductRouter);
app.use(colorOfProductRouter);
app.use(getProductRouter);
app.use(insertSubCategoryRouter);
app.use(getSubCategoriesOfCategory);
app.use(insertFieldRouter);
app.use(getFieldsRouter);
app.use(insertFieldsForSubCategory);
app.use(getFieldsOfSubCategoryRouter);
app.use(insertBrandRouter);
app.use(getBrandsRouter);
app.use(insertBrandstoSubCategoryRouter);

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
