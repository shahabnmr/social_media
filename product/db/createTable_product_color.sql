\connect social_media;

CREATE TABLE IF NOT EXISTS product.product_color
(
    id text NOT NULL,
    color_id text NOT NULL,
    product_id text NOT NULL,
    amount integer,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT product_color_pkey PRIMARY KEY (color_id,product_id),
    CONSTRAINT fk_colorId FOREIGN KEY(color_id) REFERENCES product.color(id),
    CONSTRAINT fk_productId FOREIGN KEY(product_id) REFERENCES product.product(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_product_color
    BEFORE UPDATE
    ON
		product.product_color
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE PROCEDURE insert_colorOfProduct(
    id_ text, color_id_ text, product_id_ text,amount_ integer
    )
LANGUAGE SQL
AS $$
    INSERT INTO product.product_color(id,color_id,product_id,amount) 
    VALUES (id_, color_id_, product_id_,amount_)
$$;

CREATE OR REPLACE PROCEDURE update_product_color(
    id_ text, color_id_ text, product_id_ text,amount_ integer,version_ integer
    )
LANGUAGE SQL
AS $$
    UPDATE product.product_color
    SET color_id=color_id_, product_id=product_id_, amount=amount_, version=version_
    WHERE id=id_
$$;

CREATE OR REPLACE FUNCTION findOneColorOfProduct(color_id_ text, product_id_ text)
  RETURNS SETOF product.product_color
AS
$$
    SELECT *
    FROM product.product_color 
    WHERE color_id=color_id_ AND product_id=product_id_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findProduct_color(product_color_id text)
  RETURNS SETOF product.product_color
AS
$$
    SELECT *
    FROM product.product_color 
    WHERE id=product_color_id;
$$
language sql;

CREATE OR REPLACE FUNCTION findProductsOfColor(color_id_input text)
  RETURNS SETOF product.product_color
AS
$$
    SELECT *
	FROM product.product_color
	WHERE color_id=color_id_input ;
$$
language sql;

CREATE OR REPLACE PROCEDURE delete_product_color(id_ text)
LANGUAGE SQL
AS $$
    DELETE FROM product.product_color
	  WHERE id=id_;
$$;