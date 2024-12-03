import { Publisher, Subjects, ProductColorUpdatedEvent } from '@sn_common/common';

export class ProductColorUpdatedPublisher extends Publisher<ProductColorUpdatedEvent> {
	subject: Subjects.ProductColorUpdated = Subjects.ProductColorUpdated;
}
