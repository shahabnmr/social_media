sudo kill -9 `sudo lsof -t -i:5446`
echo "Port forwarding for product db on 5446"
kubectl port-forward deployments/product-psql-depl 5446:5432 &
sleep 1

chmod 0600 ../product/db/.pgpass;
export PGPASSFILE="../product/db/.pgpass";

echo "reading port variable for psql variable..."
. ../product/db/.env

echo "running db creation..."
psql -h localhost -p 5446 -U postgres -f ../product/db/createdb.sql
sleep 1;

echo "create schema"
psql -h localhost -p 5446 -U postgres -f ../product/db/createSchema.sql
sleep 1;

echo "create tables"
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_user.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_field.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_brand.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_category.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_sub_category.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_color.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_product.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_product_color.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_brand_sub_category.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_sub_category_field.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_value_product_field.sql
psql -h localhost -p 5446 -U postgres -f ../product/db/createTable_user.sql
sleep 1;


