import { Publisher, Subjects, ProductColorCreatedEvent } from '@sn_common/common';

export class ProductColorCreatedPublisher extends Publisher<ProductColorCreatedEvent> {
	subject: Subjects.ProductColorCreated = Subjects.ProductColorCreated;
}
