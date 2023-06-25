\connect social_media;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updateddate = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS product.field
(
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata text,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT field_pkey PRIMARY KEY (id),
    CONSTRAINT field_name UNIQUE (name)
);

CREATE OR REPLACE TRIGGER updated_timestamp_field
    BEFORE UPDATE
    ON
		product.field
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE PROCEDURE insert_field(id_ text, name_ text, type_ text, metadata_ text)
LANGUAGE SQL
AS $$
    INSERT INTO product.field(id,name,type,metadata) 
    VALUES (id_, name_, type_,metadata_)
$$;

CREATE OR REPLACE FUNCTION findOneField(id_ text, name_ text)
  RETURNS SETOF product.field
AS
$$
    SELECT *
    FROM product.field 
    WHERE id=id_ OR name=name_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION findFields()
  RETURNS SETOF product.field
AS
$$
    SELECT *
    FROM product.field;
$$
language sql;