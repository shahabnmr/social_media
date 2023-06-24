import { Publisher, EmailOtpEvent, Subjects } from '@sn_common/common';

export class EmailOtpPublisher extends Publisher<EmailOtpEvent> {
	subject: Subjects.EmailOtp = Subjects.EmailOtp;
}
