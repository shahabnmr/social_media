\connect social_media;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updateddate = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS product.color
(
    id text NOT NULL,
    name text NOT NULL,
    code_color text NOT NULL,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT color_pkey PRIMARY KEY (id),
    CONSTRAINT color_name UNIQUE (name),
    CONSTRAINT color_code_color UNIQUE (code_color)
);

CREATE OR REPLACE TRIGGER updated_timestamp_color
    BEFORE UPDATE
    ON
		product.color
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE OR REPLACE PROCEDURE insert_color(id_ text, name_ text, code_color_ text)
LANGUAGE SQL
AS $$
    INSERT INTO product.color(id,name,code_color) 
    VALUES (id_, name_, code_color_)
$$;

CREATE OR REPLACE FUNCTION findOneColor(id_ text, name_ text, code_color_ text)
  RETURNS SETOF product.color
AS
$$
    SELECT *
    FROM product.color 
    WHERE id=id_ OR name=name_ OR code_color=code_color LIMIT 1;
$$
language sql;