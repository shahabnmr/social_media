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

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
