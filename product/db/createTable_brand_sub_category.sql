\connect social_media;

CREATE TABLE IF NOT EXISTS product.brand_sub_category
(
    id text NOT NULL,
    sub_category_id text NOT NULL,
    brand_id text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT brand_sub_category_pkey PRIMARY KEY (sub_category_id,brand_id),
    CONSTRAINT fk_brandId FOREIGN KEY(brand_id) REFERENCES product.brand(id),
    CONSTRAINT fk_sub_categoryId FOREIGN KEY(sub_category_id) REFERENCES product.sub_category(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_brand_sub_category
    BEFORE UPDATE
    ON
		product.brand_sub_category
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE OR REPLACE PROCEDURE insert_brandsForSubCategory(
    id_ text,sub_Category_id_ text, brands text[]
    )
LANGUAGE SQL
AS $$
    INSERT INTO product.brand_sub_category( id,sub_category_id, brand_id)
	  SELECT id_,sub_Category_id_,x.brand
	  FROM unnest(brands) as x(brand)
	  WHERE NOT EXISTS(SELECT sub_Category_id_,brand_id from product.brand_sub_category
					  WHERE sub_category_id=sub_Category_id_ AND brand_id=ANY(brands));
$$;

CREATE OR REPLACE FUNCTION findOneBrandInSubCategory(sub_category_id_ text,brand_id_ text)
  RETURNS SETOF product.brand_sub_category
AS
$$
    SELECT *
    FROM product.brand_sub_category 
    WHERE sub_category_id=sub_category_id_ AND brand_id=brand_id_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findBrandsInSubCategory(sub_category_id_ text)
  RETURNS TABLE(id text,name text, description text)
AS
$$
    SELECT b.id,b.name,b.description
    FROM product.brand_sub_category bsc
    JOIN product.brand b ON bsc.brand_id=b.id
    WHERE bsc.sub_category_id=sub_category_id_;
$$
language sql;

CREATE OR REPLACE FUNCTION checkBrands(brands text[])
  RETURNS text
AS
$$
    SELECT  CASE WHEN COUNT(*) = array_length(brands, 1)
             THEN 'You Have all'
             ELSE 'one or many of brands is missing'
        END as result
FROM    product.brand
WHERE   brand.id  = ANY(brands)
$$
language sql;