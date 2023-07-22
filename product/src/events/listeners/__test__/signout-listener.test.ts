import { UserService } from '../../../services/db/psql/user';
import { SignOutEvent } from '@sn_common/common';
import { natsWrapper } from '../../../nats-wrapper';
import { SignOutListener } from '../signout-listener';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const email = 'test@test.com';
	const listener = new SignOutListener(natsWrapper.client);

	const userService = await UserService.getInstance();
	await userService.insert({ email, status: true, version: 0 });

	const data: SignOutEvent['data'] = {
		version: 1,
		email,
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

describe('sign out listener', () => {
	it('update version for sign out and status must be false', async () => {
		const { listener, msg, data } = await setup();

		await listener.onMessage(data, msg);

		const userService = await UserService.getInstance();
		const user = await userService.findOne('', data.email);

		expect(user.email).toEqual(data.email);
		expect(user.status).toEqual(false);
		expect(user.version).toEqual(data.version);
	});

	it('ack message', async () => {
		const { listener, msg, data } = await setup();

		await listener.onMessage(data, msg);

		expect(msg.ack).toHaveBeenCalled();
	});

	it('does not ack message if versions not match', async () => {
		const { listener, msg, data } = await setup();

		data.version = 10;
		await listener.onMessage(data, msg);

		expect(msg.ack).not.toHaveBeenCalled();
	});
});
