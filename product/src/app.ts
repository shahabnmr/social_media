import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError } from '@sn_common/common';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

import Dbservice from './services/db/common/postgres/db.service';

import { getBrandRouter } from './routes/v1/brand/brand_get';
import { postBrandRouter } from './routes/v1/brand/brand_post';
import { getCategoryRouter } from './routes/v1/category/category_get';
import { postCategoryRouter } from './routes/v1/category/category_post';
import { getColorRouter } from './routes/v1/color/color_get';
import { postColorRouter } from './routes/v1/color/color_post';
import { deleteColorRouter } from './routes/v1/color/color_delete';
import { getProductRouter } from './routes/v1/product/product_get';
import { postProductRouter } from './routes/v1/product/product_post';
import { getSubCategoryRouter } from './routes/v1/subCategory/subCategory_get';
import { postSubCategoryRouter } from './routes/v1/subCategory/subCategory_post';
import { updateColorRouter } from './routes/v1/color/color_put';

import { checkFileType } from './services/multer/checkFileType';

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	message: 'too many request from this IP, pls try again after in a few minutes ',
	headers: true,
	keyGenerator: (req) => {
		return req.ip || '';
	},
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

app.use(currentUser);

app.use(postBrandRouter);
app.use(getBrandRouter);
app.use(postCategoryRouter);
app.use(getCategoryRouter);
app.use(upload.array('images', 5), postProductRouter);
app.use(getProductRouter);
app.use(getColorRouter);
app.use(postColorRouter);
app.use(postSubCategoryRouter);
app.use(getSubCategoryRouter);
app.use(deleteColorRouter);
app.use(updateColorRouter);

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
