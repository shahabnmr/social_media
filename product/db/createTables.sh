echo "stop docker container old"
docker stop social_media_product

echo "remove docker container old"
docker rm social_media_product

echo "remove images docker old"
docker image rm -f social_media/product:0.1

# echo "remove postgres_volume"
# docker volume rm product_postgres_volume

echo "build image postgress"
docker build -t social_media/product:0.1 .
sleep 2;

# echo "create postgres_volume"
# docker volume create product_postgres_volume
# sleep 2;

echo "running docker"
docker run -d --name social_media_product -p 5446:5432 social_media/product:0.1
sleep 5;

chmod 0600 ./.pgpass;
export PGPASSFILE="./.pgpass";

echo "reading port variable for psql variable..."
. ./test.env

echo "running db creation..."
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createdb.sql
sleep 1;

echo "create schema"
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createSchema.sql
sleep 1;

echo "create tables"
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_field.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_brand.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_category.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_sub_category.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_color.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_product.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_product_color.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_brand_sub_category.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_sub_category_field.sql
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTable_value_product_field.sql
sleep 1;

echo "insert data to tables"
# psql -h localhost -p ${PORT_PSQL} -U postgres -f ./test/product-insert-to-features.sql

# docker volume prune -f

echo "done"