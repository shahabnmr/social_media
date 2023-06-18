\connect social_media;

CREATE TABLE IF NOT EXISTS product.value_product_field
(
    id text NOT NULL,
    sub_category_field_id text NOT NULL,
    product_id text NOT NULL,
    value text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT value_product_field_pkey PRIMARY KEY (id),
    CONSTRAINT fk_sub_category_fieldId FOREIGN KEY(sub_category_field_id) REFERENCES product.sub_category_field(id),
    CONSTRAINT fk_productId FOREIGN KEY(product_id) REFERENCES product.product(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_value_product_field
    BEFORE UPDATE
    ON
		product.value_product_field
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();