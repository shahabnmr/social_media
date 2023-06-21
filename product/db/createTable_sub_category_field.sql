\connect social_media;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS product.sub_category_field
(
    id UUID NOT NULL DEFAULT uuid_generate_v1(),
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

CREATE OR REPLACE PROCEDURE insert_fieldsForSubCategory(
    sub_Category_id_ text, fields text[]
    )
LANGUAGE SQL
AS $$
    INSERT INTO product.sub_category_field( sub_category_id, field_id)
	  SELECT sub_Category_id_,x.field
	  FROM unnest(fields) as x(field)
	  WHERE NOT EXISTS(SELECT sub_Category_id_,field_id from product.sub_category_field
					  WHERE sub_category_id=sub_Category_id_ AND field_id=ANY(fields));
$$;

CREATE OR REPLACE FUNCTION findFieldsOfSubCategory(sub_category_id_ text, sub_category_name text)
  RETURNS table(id text,name text,type text,metadata text)
AS
$$
    SELECT f.id,f.name,f.type,f.metadata
    FROM product.sub_category_field scf
    JOIN product.field f ON f.id=scf.field_id
    JOIN product.sub_category sc ON sc.id=scf.sub_category_id
    WHERE scf.sub_category_id=sub_category_id_ OR sc.name=sub_category_name;
$$
language sql;

CREATE OR REPLACE FUNCTION checkFieldsInSubCategoryField(sub_category_id_ text,field_id_ text[])
  RETURNS SETOF product.sub_category_field
AS
$$
    SELECT *
    FROM product.sub_category_field
    WHERE sub_category_id=sub_category_id_ AND field_id=ANY(field_id_);
$$
language sql;