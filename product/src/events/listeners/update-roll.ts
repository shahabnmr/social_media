import { Listener, UpdateRollEvent, Subjects, BadRequestError } from '@sn_common/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { UserService } from '../../services/db/psql/user';

export class UpdateRollLintener extends Listener<UpdateRollEvent> {
	subject: Subjects.UpdateRoll = Subjects.UpdateRoll;
	queueGroupName = queueGroupName;

	async onMessage(data: UpdateRollEvent['data'], msg: Message) {
		const { email, roll, version } = data;

		const userService = await UserService.getInstance();
		const user = await userService.findOne('', email);

		if (!user) throw Error('email not found');

		const result = await userService.updateRoll(email, roll, version);

		if (result === 'true') msg.ack();
	}
}
