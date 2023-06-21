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
    CONSTRAINT value_product_field_pkey PRIMARY KEY (id),
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