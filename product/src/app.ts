import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@sn_common/common';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

import Dbservice from './services/db/common/postgres/db.service';
import { insertCategoryRouter } from './routes/insert/insert_category';
import { insertColorRouter } from './routes/insert/insert_color';
import { insertProductRouter } from './routes/insert/insert_product';
import { colorOfProductRouter } from './routes/insert/insert_product_color';
import { getProductRouter } from './routes/get/get_product';
import { insertSubCategoryRouter } from './routes/insert/insert_sub_category';
import { getSubCategoriesOfCategory } from './routes/get/get_sub_category_of_categories';
import { insertFieldRouter } from './routes/insert/insert_field';
import { getFieldsRouter } from './routes/get/get_fields';
import { insertFieldsForSubCategory } from './routes/insert/insert_fieldsForSub_category';
import { getFieldsOfSubCategoryRouter } from './routes/get/get_field_Of_subCategory';
import { insertBrandRouter } from './routes/insert/insert_brand';
import { getBrandsRouter } from './routes/get/get_brands';
import { insertBrandstoSubCategoryRouter } from './routes/insert/insert_brand_to_subCategory';
import { checkFileType } from './services/multer/checkFileType';

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	message: 'too many request from this IP, pls try again after in a few minutes ',
});

app.use('/images', express.static(path.join(__dirname, 'public')));

const storageEngine = multer.diskStorage({
	destination: './src/public',
	filename: (req, file, cd) => {
		cd(null, `${uuidv4()}_${Date.now()}_${file.originalname}`);
	},
});

const upload = multer({
	storage: storageEngine,
	limits: { fileSize: 8000000 },
	fileFilter: (req, file, cb) => {
		checkFileType(file, cb);
	},
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
app.use(upload.array('images', 5), insertProductRouter);
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
