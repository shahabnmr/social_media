import { Listener, SignOutEvent, Subjects } from '@sn_common/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { UserService } from '../../services/db/psql/user';

export class SignOutListener extends Listener<SignOutEvent> {
	subject: Subjects.SignOut = Subjects.SignOut;
	queueGroupName = queueGroupName;

	async onMessage(data: SignOutEvent['data'], msg: Message) {
		let result;
		const { email, version } = data;

		const userService = await UserService.getInstance();
		const user = await userService.findOne('', email);
		result = await userService.update(email, false, version);
		if (result == 'true') msg.ack();
	}
}
