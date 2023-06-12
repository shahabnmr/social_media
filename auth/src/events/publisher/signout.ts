import { Publisher, Subjects, SignOutEvent } from '@sn_common/common';

export class SignOutPublisher extends Publisher<SignOutEvent> {
	subject: Subjects.SignOut = Subjects.SignOut;
}
