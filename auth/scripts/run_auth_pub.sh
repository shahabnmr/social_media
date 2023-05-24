#!/bin/bash
# Read Password
echo "insert port App"
read PORT
echo "insert username psql:"
read USERNAME
read -s -p "Password psql: " SECRET
echo "host psql:"
read HOSTPSQL
echo "port psql:"
read PORTPSQL
echo "db psql:"
read DBPSQL
# killall -9 node
cd ../src/
export NODE_ENV=prod && ts-node-dev ./index.ts -p $PORT -u $USERNAME -s $SECRET -h $HOSTPSQL -q $PORTPSQL -d $DBPSQL &

