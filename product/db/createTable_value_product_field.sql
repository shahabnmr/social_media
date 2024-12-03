\connect social_media;

CREATE TABLE IF NOT EXISTS product.value_product_field
(
    id UUID NOT NULL DEFAULT uuid_generate_v1(),
    field_id text NOT NULL,
    product_id text NOT NULL,
    value text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT value_product_field_pkey PRIMARY KEY (field_id,product_id),
    CONSTRAINT fk_fieldId FOREIGN KEY(field_id) REFERENCES product.field(id),
    CONSTRAINT fk_productId FOREIGN KEY(product_id) REFERENCES product.product(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_value_product_field
    BEFORE UPDATE
    ON
		product.value_product_field
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE PROCEDURE insert_fieldsOfProduct(product_id_ text, json_fields text, sub_category_id_ text)
LANGUAGE SQL
AS $$
    INSERT INTO product.value_product_field(product_id,field_id,value)
SELECT 
	product_id_,
	datajson->>'fieldId',
	datajson->>'value'
FROM jsonb_array_elements(json_fields::jsonb) as t(datajson)
WHERE EXISTS(SELECT field_id from product.sub_category_field
					  WHERE sub_category_id=sub_category_id_ and field_id=datajson->>'fieldId') AND
	  NOT EXISTS(select id from product.value_product_field where 
				product_id=product_id_ AND field_id=datajson->>'fieldId');
$$;

CREATE OR REPLACE FUNCTION checkFieldsOfSubCategory(sub_category_id_ text, json_fields text)
  RETURNS SETOF product.sub_category_field
AS
$$
    SELECT sub_category_field.* 
    FROM product.sub_category_field,
        jsonb_array_elements(json_fields::jsonb) as t(datajson)
		WHERE sub_category_id=sub_category_id_ and field_id=datajson->>'fieldId';
$$
language sql;

CREATE OR REPLACE FUNCTION findOneProductAllInfo(product_id_ text, name_ text)
  RETURNS  TABLE(
	  id text,
	  name text,
	  description text,
	  price text,
	  images text[], 
	  colors text,
	  fields text,
	  brand text,
  	sub_category text,
		version integer
  )
AS
$$
SELECT id,p.name,p.description,p.price,p.images,c.colors,f.fields,b.brand,sc.sub_category,p.version
FROM product.product p,
	LATERAL (
		SELECT json_agg(json_build_object('id',c.id,'name',c.name,'code_color',c.code_color,'amount',pc.amount)) as colors
		FROM product.color c
		JOIN product.product_color pc ON c.id=pc.color_id
		WHERE pc.product_id=p.id)c,
	LATERAL (
		SELECT json_agg(json_build_object('id',f.id,f.name,vpf.value)) AS fields
		FROM product.field f
		JOIN product.value_product_field vpf ON f.id=vpf.field_id
		WHERE vpf.product_id=p.id)f,
	LATERAL(
		SELECT b.name AS brand 
		FROM product.brand b 
		WHERE p.brand=b.id)b,
	LATERAL(
		SELECT sc.name AS sub_category
		FROM product.sub_category sc
		WHERE p.sub_category_id=sc.id)sc
WHERE p.id=product_id_ OR p.name=name_;
$$
language sql;

CREATE OR REPLACE PROCEDURE deleteAllContent()
AS
$$
    TRUNCATE product.product,
				product.category,
				product.sub_category,
				product.product_color,
				product.value_product_field,
				product.field,
				product.brand,
				product.brand_sub_category,
				product.color,
				product.sub_category_field,
				product.user
		CASCADE;
$$
language sql;

CREATE OR REPLACE FUNCTION searchAllProducts(text_ text,
												columnname character varying, 
												sorting character varying
											)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text, rank real)
AS
$$
BEGIN
	RETURN QUERY EXECUTE format('
		SELECT t.id,t.name,t.price,t.images,t.brand,t.rank
		FROM 
			(SELECT p.id, p.name, p.price, p.images, b.brand,ts_rank_cd(
				array[0.1,0.3,0.5,1.0],
				setweight(to_tsvector(p.name), ''A'') || 
				setweight(to_tsvector(p.description), ''C'') ||
				setweight(to_tsvector(f.fields), ''B''),
				websearch_to_tsquery(%L),16) as rank
			FROM product.product p,
			LATERAL (
				SELECT json_agg(json_build_object(''id'',f.id,f.name,vpf.value)) AS fields
				FROM product.field f
				JOIN product.value_product_field vpf ON f.id=vpf.field_id
				WHERE vpf.product_id=p.id)f,
			LATERAL(
				SELECT b.name AS brand 
				FROM product.brand b 
				WHERE p.brand=b.id)b
			ORDER BY rank desc) AS t
		WHERE t.rank > 0.001
		ORDER BY t.%I %s;
		',text_,columnname,sorting);
END;
$$
language plpgsql;

CREATE OR REPLACE FUNCTION searchAllProductsExist(text_ text,
												columnname character varying, 
												sorting character varying
											)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text, rank real,total bigint)
AS
$$
BEGIN
	RETURN QUERY EXECUTE format('
		SELECT t.id,t.name,t.price,t.images,t.brand,t.rank,SUM(pc.amount) AS total
		FROM 
			(
				SELECT p.id, p.name, p.price, p.images, b.brand,ts_rank_cd(
					array[0.1,0.3,0.5,1.0],
					setweight(to_tsvector(p.name), ''A'') || 
					setweight(to_tsvector(p.description), ''C'') ||
					setweight(to_tsvector(f.fields), ''B''),
					websearch_to_tsquery(%L),16) as rank
				FROM product.product p,
				LATERAL (
					SELECT json_agg(json_build_object(''id'',f.id,f.name,vpf.value)) AS fields
					FROM product.field f
					JOIN product.value_product_field vpf ON f.id=vpf.field_id
					WHERE vpf.product_id=p.id)f,
				LATERAL(
					SELECT b.name AS brand 
					FROM product.brand b 
					WHERE p.brand=b.id)b
			) AS t
		JOIN product.product_color pc ON pc.product_id=t.id 
		GROUP BY t.id,t.name,t.price,t.images,t.brand,t.rank
		HAVING SUM(pc.amount) > 0 AND t.rank > 0.001
		ORDER BY t.%I %s;
		',text_,columnname,sorting);
END;
$$
language plpgsql;