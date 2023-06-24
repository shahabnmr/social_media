\connect social_media;

CREATE TABLE IF NOT EXISTS product.brand_sub_category
(
    id text NOT NULL,
    sub_category_id text NOT NULL,
    brand_id text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT brand_sub_category_pkey PRIMARY KEY (id),
    CONSTRAINT fk_brandId FOREIGN KEY(brand_id) REFERENCES product.brand(id),
    CONSTRAINT fk_sub_categoryId FOREIGN KEY(sub_category_id) REFERENCES product.sub_category(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_brand_sub_category
    BEFORE UPDATE
    ON
		product.brand_sub_category
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();