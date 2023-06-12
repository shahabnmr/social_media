import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');

beforeAll(async () => {
	process.env.JWT_KEY = '123qwe';
	process.env.NATS_CLIENT_ID = 'dsadasdasas';
	process.env.NATS_URL = 'string';
	process.env.NATS_CLUSTER_ID = 'string';
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
});

beforeEach(async () => {
	jest.clearAllMocks();
});

export const signin = () => {
	// build a jwt payload. {id, email}
	const payload = {
		id: '123456',
		email: 'tesast@test.com',
		tell: '01234567890',
	};

	// create the JWT
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// build session object. {jwt: MY_JWT}
	const session = { jwt: token };

	// Turn that session into json
	const sessionJSON = JSON.stringify(session);

	// take JSON and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	// return a string thats the cookie with the encoded data
	return [`session=${base64}`];
};
