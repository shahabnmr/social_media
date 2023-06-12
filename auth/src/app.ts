import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@sn_common/common';
import { rateLimit } from 'express-rate-limit';

import Dbservice from './services/db/common/postgres/db.service';
import { signupRouter } from './routes/signup';
import { currentUserRouter } from './routes/current_user';
import { signinRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { verifyUserRouter } from './routes/verify_otp';
import { forgetPasswordRouter } from './routes/forget_password';
import { resetPasswordRouter } from './routes/reset_password';
import { getProfileRouter } from './routes/get_profiel';
import { updateProfileRouter } from './routes/update_profile';
import { resendOtp } from './routes/resend_otp';

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

app.use(signupRouter);
app.use(currentUserRouter);
app.use(signOutRouter);
app.use(signinRouter);
app.use(verifyUserRouter);
app.use(forgetPasswordRouter);
app.use(resetPasswordRouter);
app.use(getProfileRouter);
app.use(updateProfileRouter);
app.use(resendOtp);

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
