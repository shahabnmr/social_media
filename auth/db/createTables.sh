echo "stop docker container old"
docker stop social_media_auth

echo "remove docker container old"
docker rm social_media_auth

echo "remove images docker old"
docker image rm -f social_media/auth:0.1

# echo "remove postgres_volume"
# docker volume rm auth_postgres_volume

echo "build image postgress"
docker build -t social_media/auth:0.1 .
sleep 2;

# echo "create postgres_volume"
# docker volume create auth_postgres_volume
# sleep 2;

echo "running docker"
docker run -d --name social_media_auth -p 5444:5432 social_media/auth:0.1
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
psql -h localhost -p ${PORT_PSQL} -U postgres -f ./createTables.sql
sleep 1;

echo "insert data to tables"
# psql -h localhost -p ${PORT_PSQL} -U postgres -f ./test/auth-insert-to-features.sql

# docker volume prune -f

echo "done"