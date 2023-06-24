import jwt from 'jsonwebtoken';
import { app } from '../app';
import request from 'supertest';
import { UserService } from '../services/db/psql/user';

jest.mock('../nats-wrapper');
jest.setTimeout(601999);

beforeAll(async () => {
	process.env.TZ = 'EST';
	process.env.NATS_CLIENT_ID = 'dsadasdasas';
	process.env.NATS_URL = 'string';
	process.env.NATS_CLUSTER_ID = 'string';
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
});

beforeEach(async () => {
	jest.clearAllMocks();
});

export const signin = async () => {
	const userService = await UserService.getInstance();

	const email = 'test@test.com';

	const res = await request(app)
		.post('/api/v1/auth/signup')
		.send({
			name: 'shahab',
			family: 'asd',
			tell: '01234567891',
			email,
			password: '123qwe',
			confirmPassword: '123qwe',
		})
		.expect(201);

	const details = res.get('Set-Cookie');

	const user = await userService.findOne(email, '', '');
	const otp = await userService.findOneOtp('', user.id);

	const res2 = await request(app)
		.post('/api/v1/auth/verify')
		.set('Cookie', details)
		.send({
			otp: otp.otp,
		})
		.expect(200);
	expect(res2.body.user).toBeDefined();

	const cookie = res2.get('Set-Cookie');

	return { cookie, details };
};
