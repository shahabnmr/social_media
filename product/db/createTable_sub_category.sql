\connect social_media;

CREATE TABLE IF NOT EXISTS product.sub_category
(
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT sub_category_pkey PRIMARY KEY (id),
    CONSTRAINT sub_category_name UNIQUE (name),
    CONSTRAINT fk_categoryId FOREIGN KEY(category) REFERENCES product.category(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_sub_category
    BEFORE UPDATE
    ON
		product.sub_category
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();