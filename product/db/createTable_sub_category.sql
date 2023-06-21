\connect social_media;

CREATE TABLE IF NOT EXISTS product.sub_category
(
    id text NOT NULL,
    name text NOT NULL,
    category_id text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT sub_category_pkey PRIMARY KEY (id),
    CONSTRAINT sub_category_name UNIQUE (name),
    CONSTRAINT fk_categoryId FOREIGN KEY(category_id) REFERENCES product.category(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_sub_category
    BEFORE UPDATE
    ON
		product.sub_category
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE PROCEDURE insert_sub_category(id_ text, name_ text, category_id_ text)
LANGUAGE SQL
AS $$
    INSERT INTO product.sub_category(id,name,category_id) 
    VALUES (id_, name_, category_id_)
$$;

CREATE OR REPLACE FUNCTION findOneSubCategory(id_ text, name_ text)
  RETURNS TABLE(id text,name text,createddate text,updateddate text,category_name text)
AS
$$
    SELECT sc.id,sc.name,sc.createddate,sc.updateddate,c.name AS category_name
    FROM product.sub_category sc
    JOIN product.category c ON sc.category_id=c.id
    WHERE sc.id=id_ OR sc.name=name_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findSubCategoriesOfCategory(category_id_ text, name_ text)
  RETURNS TABLE(id text,name text,createddate text,updateddate text)
AS
$$
    SELECT sc.id,sc.name,sc.createddate,sc.updateddate
    FROM product.sub_category sc
    JOIN product.category c ON sc.category_id=c.id
    WHERE sc.category_id=category_id_ OR c.name=name_;
$$
language sql;