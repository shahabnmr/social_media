import { Publisher, Subjects, ProductDeletedEvent } from '@sn_common/common';

export class ProductDeletedPublisher extends Publisher<ProductDeletedEvent> {
	subject: Subjects.ProductDeleted = Subjects.ProductDeleted;
}
