import { Publisher, Subjects, UpdateRollEvent } from '@sn_common/common';

export class UpdateRollPublisher extends Publisher<UpdateRollEvent> {
	subject: Subjects.UpdateRoll = Subjects.UpdateRoll;
}
