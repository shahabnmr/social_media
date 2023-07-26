import { UserService } from '../../../services/db/psql/user';
import { UpdateRollEvent, Roll } from '@sn_common/common';
import { natsWrapper } from '../../../nats-wrapper';
import { UpdateRollLintener } from '../update-roll';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const userService = await UserService.getInstance();
	const user = await userService.insert({ email: 'test@test.com', status: true, version: 0 });
	const listener = new UpdateRollLintener(natsWrapper.client);

	const data: UpdateRollEvent['data'] = {
		version: 1,
		email: 'test@test.com',
		roll: Roll.Admin,
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { userService, listener, data, msg };
};

describe('update roll', () => {
	it('update roll successful', async () => {
		const { data, listener, msg, userService } = await setup();

		await listener.onMessage(data, msg);

		const result = await userService.findOne('', 'test@test.com');

		expect(result.roll).toEqual('admin');
		expect(result.version).toEqual(1);
	});

	it('ack message', async () => {
		const { listener, msg, data } = await setup();

		await listener.onMessage(data, msg);

		expect(msg.ack).toHaveBeenCalled();
	});

	it('not ack message if email not found', async () => {
		const { listener, msg, data } = await setup();
		data.email = 'wrongEmail.email.com';
		try {
			await listener.onMessage(data, msg);
		} catch (err: any) {
			expect(err.message).toBe('email not found');
			expect(msg.ack).not.toHaveBeenCalled();
		}
	});
});
