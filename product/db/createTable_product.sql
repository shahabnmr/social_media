\connect social_media;

CREATE TABLE IF NOT EXISTS product.product
(
    id character varying NOT NULL,
    name text  NOT NULL,
    description text,
    images text[],
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    version integer DEFAULT 0,
    sub_category_id text NOT NULL,
    price text NOT NULL,
    brand text NOT NULL,
    CONSTRAINT product_pkey PRIMARY KEY (id),
    CONSTRAINT product_name UNIQUE (name),
    CONSTRAINT fk_sub_categoryId FOREIGN KEY(sub_category_id) REFERENCES product.sub_category(id),
    CONSTRAINT fk_brandId FOREIGN KEY(brand) REFERENCES product.brand(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_product
    BEFORE UPDATE
    ON
		product.product
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE INDEX  index_product_createddate ON product.product(createddate DESC NULLS LAST);
CREATE INDEX  index_product_price ON product.product(price DESC NULLS LAST);

CREATE OR REPLACE PROCEDURE insert_product(
    id_ text, name_ text, description_ text,images_ text[], price_ text,sub_category_id_ text,brandId text
    )
LANGUAGE SQL
AS $$
    INSERT INTO product.product(id,name,description,images,price,sub_category_id,brand) 
    VALUES (id_, name_, description_,images_,price_,sub_category_id_,brandId)
$$;

CREATE OR REPLACE FUNCTION findOneProduct(id_ text, name_ text)
  RETURNS SETOF product.product
AS
$$
    SELECT *
    FROM product.product 
    WHERE id=id_ OR name=name_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findProducts(columnname character varying, sorting character varying)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text)
AS
$$
BEGIN
    RETURN QUERY EXECUTE format('
      SELECT p.id, p.name, p.price, p.images, b.name AS brand
      FROM product.product p
      JOIN product.brand b ON b.id=p.brand
      ORDER BY p.%I %s;
    ',columnname,sorting);
END;
$$
language plpgsql;

CREATE OR REPLACE FUNCTION findProductsExist(columnname character varying, sorting character varying)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text,total bigint)
AS
$$
BEGIN
	RETURN QUERY EXECUTE format('
				    SELECT p.id, p.name, p.price, p.images, b.name as brand,SUM(pc.amount) AS total
  					FROM product.product p
  					JOIN product.brand b ON b.id=p.brand
					  JOIN product.product_color pc ON pc.product_id=p.id
					  GROUP BY p.id,p.name,b.name
					  HAVING SUM(pc.amount) > 0
					  ORDER BY p.%I %s;
				   ',columnname,sorting);
END;
$$
language plpgsql;

CREATE OR REPLACE FUNCTION findProductsOfSubCategory(subCategoryId_ text,
													 columnname character varying, 
													 sorting character varying)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text)
AS
$$
BEGIN
	RETURN QUERY EXECUTE format('
    	SELECT p.id, p.name, p.price, p.images, b.name as brand
    	FROM product.product p
   		JOIN product.brand b ON b.id=p.brand
		  WHERE p.sub_category_id=%L
		  ORDER BY p.%I %s;
		',subCategoryId_,columnname,sorting);
END;
$$
language plpgsql;

CREATE OR REPLACE FUNCTION findProductsOfSubCategoryExist(subCategoryId_ text,
													 columnname character varying, 
													 sorting character varying)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text,total bigint)
AS
$$
BEGIN
	RETURN QUERY EXECUTE format('
    SELECT p.id, p.name, p.price, p.images, b.name as brand,SUM(pc.amount) AS total
    FROM product.product p
   	JOIN product.brand b ON b.id=p.brand
		JOIN product.product_color pc ON pc.product_id=p.id
		GROUP BY p.id,p.name,b.name		
		HAVING SUM(pc.amount) > 0 AND p.sub_category_id=%L
		ORDER BY p.%I %s;
		',subCategoryId_,columnname,sorting);
END;
$$
language plpgsql;

CREATE OR REPLACE FUNCTION findProductsOfCategory(categoryId_ text,
												 columnname character varying, 
												 sorting character varying)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text)
AS
$$
BEGIN
	RETURN QUERY EXECUTE format('
    	SELECT p.id, p.name, p.price, p.images, b.name as brand
    	FROM product.product p
    	JOIN product.brand b ON b.id=p.brand
	  	JOIN product.sub_category sb ON sb.id=p.sub_category_id
	  	WHERE category_id=%L
		  ORDER BY p.%I %s;
		',categoryId_,columnname,sorting);
END;
$$
language plpgsql;

CREATE OR REPLACE FUNCTION findProductsOfCategoryExist(categoryId_ text,
												 columnname character varying, 
												 sorting character varying)
  RETURNS TABLE(id character varying, name text, price text, images text[],brand text,total bigint)
AS
$$
BEGIN
	RETURN QUERY EXECUTE format('
    SELECT p.id, p.name, p.price, p.images, b.name as brand,SUM(pc.amount) AS total
    FROM product.product p
    JOIN product.brand b ON b.id=p.brand
	  JOIN product.sub_category sb ON sb.id=p.sub_category_id
		JOIN product.product_color pc ON pc.product_id=p.id
	  GROUP BY p.id,p.name,b.name,category_id	
		HAVING SUM(pc.amount) > 0 AND category_id=%L
		ORDER BY p.%I %s;
		',categoryId_,columnname,sorting);
END;
$$
language plpgsql;