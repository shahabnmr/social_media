\connect social_media;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updateddate = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE rolls_type AS ENUM ('user', 'admin', 'seller');

CREATE TABLE IF NOT EXISTS product.user
(
    id text NOT NULL,
    email text NOT NULL,
    status boolean,
    version integer NOT NULL,
    roll rolls_type DEFAULT 'user',
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

CREATE INDEX  index_user_email ON product.user(email DESC NULLS LAST);


CREATE OR REPLACE PROCEDURE insert_user(id_ text, email_ text, status_ boolean, version_ integer)
LANGUAGE SQL
AS $$
    INSERT INTO product.user(id,email,status, version) 
    VALUES (id_, email_, status_,version_)
$$;

CREATE OR REPLACE FUNCTION update_user(email_ text ,status_ boolean,version_ integer)
RETURNS text AS
$BODY$
DECLARE result_ text;
BEGIN
    UPDATE product.user
    SET status=status_, version=version_
    WHERE email=email_ AND version_=version + 1
    RETURNING 'true' INTO result_;
	  RETURN result_;
END;
$BODY$
LANGUAGE plpgsql
VOLATILE;

CREATE OR REPLACE FUNCTION findOneUser(id_ text, email_ text)
  RETURNS SETOF product.user
AS
$$
    SELECT *
    FROM product.user 
    WHERE id=id_ OR email=email_ LIMIT 1;
$$
language sql;