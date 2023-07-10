\connect social_media;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updateddate = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS product.user
(
    id text NOT NULL,
    email text NOT NULL,
    status boolean,
    version integer DEFAULT 0,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user_email UNIQUE (email)
);

CREATE OR REPLACE TRIGGER updated_timestamp_user
    BEFORE UPDATE
    ON
		product.user
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE OR REPLACE PROCEDURE insert_user(id_ text, email_ text, status_ boolean)
LANGUAGE SQL
AS $$
    INSERT INTO product.user(id,email,status) 
    VALUES (id_, email_, status_)
$$;

CREATE OR REPLACE FUNCTION findOneBrand(id_ text, email_ text)
  RETURNS SETOF product.user
AS
$$
    SELECT *
    FROM product.user 
    WHERE id=id_ OR email=email_ LIMIT 1;
$$
language sql;