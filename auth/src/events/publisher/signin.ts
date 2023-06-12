import { Publisher, Subjects, SignInEvent } from '@sn_common/common';

export class SignInPublisher extends Publisher<SignInEvent> {
	subject: Subjects.SignIn = Subjects.SignIn;
}
