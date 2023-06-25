\connect social_media;

CREATE TABLE IF NOT EXISTS product.brand
(
    id text NOT NULL,
    name text NOT NULL,
    description text,
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


CREATE OR REPLACE PROCEDURE insert_brand(id_ text, name_ text, description_ text)
LANGUAGE SQL
AS $$
    INSERT INTO product.brand(id,name,description) 
    VALUES (id_, name_, description_)
$$;

CREATE OR REPLACE FUNCTION findOneBrand(id_ text, name_ text)
  RETURNS SETOF product.brand
AS
$$
    SELECT *
    FROM product.brand 
    WHERE id=id_ OR name=name_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findBrands()
  RETURNS SETOF product.brand
AS
$$
    SELECT *
    FROM product.brand;
$$
language sql;