\connect social_media;

CREATE TABLE IF NOT EXISTS product.category
(
    id text NOT NULL,
    name text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT category_pkey PRIMARY KEY (id),
    CONSTRAINT category_name UNIQUE (name)
);

CREATE OR REPLACE TRIGGER updated_timestamp_category
    BEFORE UPDATE
    ON
		product.category
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE OR REPLACE PROCEDURE insert_category(id_ text, name_ text)
LANGUAGE SQL
AS $$
    INSERT INTO product.category(id,name) 
    VALUES (id_, name_)
$$;


CREATE OR REPLACE FUNCTION findOneCategory(id_ text, name_ text)
  RETURNS SETOF product.category
AS
$$
    SELECT *
    FROM product.category 
    WHERE id=id_ OR name=name_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findCategories()
  RETURNS SETOF product.category
AS
$$
    SELECT *
    FROM product.category;
$$
language sql;