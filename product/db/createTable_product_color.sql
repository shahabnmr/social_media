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

CREATE OR REPLACE FUNCTION findOneColorOfProduct(color_id_ text, product_id_ text)
  RETURNS SETOF product.product_color
AS
$$
    SELECT *
    FROM product.product_color 
    WHERE color_id=color_id_ AND product_id=product_id_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findOneProductAllInfo(product_id_ text, name_ text)
  RETURNS  table(id text,name text, description text, price text, colors text)
AS
$$
select id,p.name,p.description,p.price,c.colors
from product.product p,LATERAL (
		SELECT json_agg(json_build_object('id',c.id,'name',c.name,'code_color',c.code_color,'amount',pc.amount)) as colors
		from product.color c
		join product.product_color pc on c.id=pc.color_id
		where pc.product_id=p.id
)c
where p.id=product_id_ OR p.name=name_;
$$
language sql;