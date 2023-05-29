import { Subjects, ForgetPasswordEvent, Publisher } from '@sn_common/common';

export class ForgetPasswordPublisher extends Publisher<ForgetPasswordEvent> {
	subject: Subjects.ForgetPassword = Subjects.ForgetPassword;
}
