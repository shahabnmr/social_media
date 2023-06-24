\connect social_media;

CREATE TABLE IF NOT EXISTS product.sub_category_field
(
    id text NOT NULL,
    sub_category_id text NOT NULL,
    field_id text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT sub_category_field_pkey PRIMARY KEY (id),
    CONSTRAINT fk_sub_categoryId FOREIGN KEY(sub_category_id) REFERENCES product.sub_category(id),
    CONSTRAINT fk_fieldId FOREIGN KEY(field_id) REFERENCES product.field(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_sub_category_field
    BEFORE UPDATE
    ON
		product.sub_category_field
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();