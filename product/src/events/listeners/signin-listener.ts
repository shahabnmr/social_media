import { Message } from 'node-nats-streaming';
import { Subjects, Listener, SignInEvent } from '@sn_common/common';
import { queueGroupName } from './queue-group-name';
import { UserService } from '../../services/db/psql/user';

export class SignInListener extends Listener<SignInEvent> {
	subject: Subjects.SignIn = Subjects.SignIn;
	queueGroupName = queueGroupName;

	async onMessage(data: SignInEvent['data'], msg: Message) {
		let result;
		const { email, version } = data;

		const userService = await UserService.getInstance();
		const user = await userService.findOne('', email);
		if (!user) {
			result = await userService.insert({ email, version, status: true });
			msg.ack();
		} else {
			result = await userService.update(email, true, Math.floor(version));
			if (result == 'true') {
				msg.ack();
			}
		}
	}
}
