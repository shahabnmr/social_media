sudo kill -9 `sudo lsof -t -i:5445`
echo "Port forwarding for auth db on 5445"
kubectl port-forward deployments/auth-psql-depl 5445:5432 &
sleep 1

chmod 0600 ../auth/db/.pgpass;
export PGPASSFILE="../auth/db/.pgpass";

echo "reading port variable for psql variable..."
. ../auth/db/.env

echo "running db creation..."
psql -h localhost -p 5445 -U postgres -f ../auth/db/createdb.sql
sleep 1;

echo "create schema"
psql -h localhost -p 5445 -U postgres -f ../auth/db/createSchema.sql
sleep 1;

echo "create tables"
psql -h localhost -p 5445 -U postgres -f ../auth/db/createTables.sql
sleep 1;


