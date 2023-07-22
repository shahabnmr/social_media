import { UserService } from '../../../services/db/psql/user';
import { SignInEvent } from '@sn_common/common';
import { natsWrapper } from '../../../nats-wrapper';
import { SignInListener } from '../signin-listener';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new SignInListener(natsWrapper.client);

	const data: SignInEvent['data'] = {
		version: 0,
		email: 'test@test.com',
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

describe('signin listener', () => {
	it('create a user and save', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		const userService = await UserService.getInstance();
		const user = await userService.findOne('', data.email);

		expect(user).toBeDefined();
		expect(user!.version).toEqual(data.version);
		expect(user!.status).toEqual(true);
	});

	it('ack the message', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		expect(msg.ack).toHaveBeenCalled();
	});

  it('does not ack message if versions not match', async () => {
		const { listener, msg, data } = await setup();
		data.version = 10;

		const userService = await UserService.getInstance();
		await userService.insert({ email: data.email, status: true, version: 0 });

		await listener.onMessage(data, msg);

		expect(msg.ack).not.toHaveBeenCalled();
	});

	it('update version if user exist', async () => {
		const { listener, data, msg } = await setup();
		data.version = 1;
		const userService = await UserService.getInstance();
		await userService.insert({ email: data.email, status: true, version: 0 });

		await listener.onMessage(data, msg);

		const user = await userService.findOne('', data.email);

		expect(user.version).toEqual(1);
	});

	it('ack message for update version', async () => {
		const { listener, data, msg } = await setup();
		data.version = 1;
		const userService = await UserService.getInstance();
		await userService.insert({ email: data.email, status: true, version: 0 });

		await listener.onMessage(data, msg);

		expect(msg.ack).toHaveBeenCalled();
	});
});
