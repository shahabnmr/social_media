\connect social_media;

CREATE TABLE IF NOT EXISTS product.product
(
    id character varying NOT NULL,
    name text  NOT NULL,
    description text,
    images text array,
    amount integer,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    version integer DEFAULT 0,
    -- sub_category text NOT NULL,
    price text NOT NULL,
    -- brand text NOT NULL,
    CONSTRAINT product_pkey PRIMARY KEY (id),
    CONSTRAINT product_name UNIQUE (name)
    -- CONSTRAINT fk_sub_categoryId FOREIGN KEY(sub_category) REFERENCES product.sub_category(id),
    -- CONSTRAINT fk_brandId FOREIGN KEY(brand) REFERENCES product.brand(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_product
    BEFORE UPDATE
    ON
		product.product
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE PROCEDURE insert_product(
    id_ text, name_ text, description_ text,images_ text[], price_ text
    )
LANGUAGE SQL
AS $$
    INSERT INTO product.product(id,name,description,images,price) 
    VALUES (id_, name_, description_,images_,price_)
$$;

CREATE OR REPLACE FUNCTION findOneProduct(id_ text, name_ text)
  RETURNS SETOF product.color
AS
$$
    SELECT *
    FROM product.color 
    WHERE id=id_ OR name=name_ LIMIT 1;
$$
language sql;