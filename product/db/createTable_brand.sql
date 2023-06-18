\connect social_media;

CREATE TABLE IF NOT EXISTS product.brand
(
    id text NOT NULL,
    name text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT brand_pkey PRIMARY KEY (id),
    CONSTRAINT brand_name UNIQUE (name)
);

CREATE OR REPLACE TRIGGER updated_timestamp_brand
    BEFORE UPDATE
    ON
		product.brand
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();