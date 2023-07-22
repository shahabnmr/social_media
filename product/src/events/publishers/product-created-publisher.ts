import { Publisher, Subjects, ProductCreatedEvent } from '@sn_common/common';

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
	subject: Subjects.productCreated = Subjects.productCreated;
}
