\connect social_media;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updateddate = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE rolls_type AS ENUM ('user', 'admin', 'seller');

CREATE TABLE IF NOT EXISTS auth.user
(
    id character varying NOT NULL,
    email text  NOT NULL,
    name text  NOT NULL,
    family text NOT NULL,
    tell text,
    password text,
    roll rolls_type DEFAULT 'user',
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    version integer DEFAULT 0,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user_email UNIQUE (email),
    CONSTRAINT user_tell UNIQUE (tell)
);

CREATE TABLE IF NOT EXISTS auth.otp
(
    id text NOT NULL,
    userId text,
    otp text,
    expiration_time timestamp,
    active boolean DEFAULT null,
    createddate timestamp with time zone NOT NULL DEFAULT now(),
    updateddate timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT opt_pkey PRIMARY KEY (id),
    CONSTRAINT fk_userId FOREIGN KEY(userId) REFERENCES auth.user(id)
);

CREATE OR REPLACE TRIGGER updated_timestamp_otp
    BEFORE UPDATE
    ON
		auth.otp
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE TRIGGER updated_timestamp_user
    BEFORE UPDATE
    ON
		auth.user
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



--USER procedure

CREATE OR REPLACE PROCEDURE insert_user(
	id_ text, name_ text, family_ text, tell_ text, email_ text, password_ text
)
LANGUAGE SQL
AS $$
    INSERT INTO auth.user(id,email,name,family,tell,password) 
    VALUES (id_,email_ , name_ , family_ , tell_, password_ )
$$;

CREATE OR REPLACE PROCEDURE update_user(id_ text ,name_ text, family_ text,tell_ text,email_ text)
LANGUAGE SQL
AS $$
    UPDATE auth.user
    SET email=email_, tell=tell_, name=name_, family=family_
    WHERE id=id_
$$;

CREATE OR REPLACE PROCEDURE update_roll(email_ text,roll_ rolls_type)
LANGUAGE SQL
AS $$
    UPDATE auth.user
    SET roll=roll_
    WHERE email=email_
$$;

CREATE OR REPLACE FUNCTION update_version_user(id_or_email_ text)
RETURNS text AS
$BODY$
DECLARE version_ text;
BEGIN
	UPDATE auth.user
    SET version=version + 1
    WHERE id=id_or_email_ OR email=id_or_email_
	RETURNING version INTO version_;
	RETURN version_;
END;
$BODY$
LANGUAGE plpgsql
VOLATILE;

CREATE OR REPLACE PROCEDURE reset_pass(id_ text, password_ text)
LANGUAGE SQL
AS $$
    UPDATE auth.user
    SET password=password_
    WHERE id=id_
$$;

CREATE OR REPLACE PROCEDURE insert_otp(
    id_ text,otp_ text,expiration_time_ timestamp, userId_ text
    )
LANGUAGE SQL
AS $$
    INSERT INTO auth.otp(id,otp,expiration_time,userId) 
    VALUES (id_,otp_ , expiration_time_, userId_)
$$;

CREATE OR REPLACE PROCEDURE update_otp(id_ text, value boolean)
LANGUAGE SQL
AS $$
    UPDATE auth.otp
    SET active=value
    WHERE id=id_
$$;

CREATE OR REPLACE PROCEDURE delete_otp(id_ text)
LANGUAGE SQL
AS $$
    DELETE FROM auth.otp
    WHERE userId=id_ AND active is null
$$;

CREATE OR REPLACE PROCEDURE delete_otp_id(id_ text)
LANGUAGE SQL
AS $$
    DELETE FROM auth.otp
    WHERE id=id_
$$;

CREATE OR REPLACE PROCEDURE delete_user(email_ text)
LANGUAGE SQL
AS $$
    DELETE FROM auth.user
    WHERE email=email_
$$;

CREATE OR REPLACE FUNCTION findOne_user(email_ text, tell_ text, id_ text)
  RETURNS SETOF auth.user
AS
$$
    SELECT *
    FROM auth.user 
    WHERE email=email_ OR tell=tell_ OR id=id_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE FUNCTION find_users(email_ text, tell_ text, id_ text)
  RETURNS SETOF auth.user
AS
$$
    SELECT * 
    FROM auth.user 
    WHERE email= email_ OR tell=tell_ OR id=id_;
$$
language sql;

CREATE OR REPLACE FUNCTION findOne_otp(id_ text, userid_ text)
  RETURNS SETOF auth.otp
AS
$$
    SELECT * 
    FROM auth.otp 
    WHERE id=id_ OR userid=userid_ LIMIT 1;
$$
language sql;

CREATE OR REPLACE PROCEDURE deleteAllContent()
AS
$$
    TRUNCATE auth.user,auth.otp
		CASCADE;
$$
language sql;
