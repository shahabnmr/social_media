import { Publisher, Subjects, ProductColorDeletedEvent } from '@sn_common/common';

export class ProductColorDeletedPublisher extends Publisher<ProductColorDeletedEvent> {
	subject: Subjects.ProductColorDeleted = Subjects.ProductColorDeleted;
}
