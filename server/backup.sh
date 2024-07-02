#!/bin/bash

TIMESTAMP=$(date +%Y%m%d%H%M%S)
HOST=127.0.0.1
BACKUP_DIR=./backup/$(date +%Y%m%d)

if [ ! -d ./backup ]; then
	mkdir backup
fi
if [ ! -d $BACKUP_DIR ]; then
	mkdir $BACKUP_DIR
fi

## read .env file as environment variables
export $(grep -v '^#' .env | xargs -d '\n')

## backup redis
REDIS_DUMP_FILE_NAME=redis-$TIMESTAMP.rdb
REDIS_DUMP_FILE=$BACKUP_DIR/$REDIS_DUMP_FILE_NAME
docker exec -it $CONTAINER_NAME_PREFIX-$REDIS_SERVICE redis-cli --pass $REDIS_ROOT_PASSWORD --rdb $REDIS_DUMP_FILE_NAME
docker cp $CONTAINER_NAME_PREFIX-$REDIS_SERVICE:/data/$REDIS_DUMP_FILE_NAME $REDIS_DUMP_FILE
docker exec -it $CONTAINER_NAME_PREFIX-$REDIS_SERVICE rm /data/$REDIS_DUMP_FILE_NAME
echo "redis dumped"

## backup mongodb
MONGO_DUMP_FILE_NAME=mongo-$TIMESTAMP.gz
MONGO_DUMP_FILE=$BACKUP_DIR/$MONGO_DUMP_FILE_NAME
docker exec -it $CONTAINER_NAME_PREFIX-$MONGO_SERVICE mongodump --username=$MONGO_ROOT_USERNAME --password=$MONGO_ROOT_PASSWORD --authenticationDatabase=admin --db=money --archive=$MONGO_DUMP_FILE_NAME --gzip
docker cp $CONTAINER_NAME_PREFIX-$MONGO_SERVICE:$MONGO_DUMP_FILE_NAME $MONGO_DUMP_FILE
docker exec -it $CONTAINER_NAME_PREFIX-$MONGO_SERVICE rm $MONGO_DUMP_FILE_NAME
echo "mongodb dumped"

## backup postgres
POSTGRES_DUMP_FILE=$BACKUP_DIR/postgres-$TIMESTAMP.dump
docker exec -it $CONTAINER_NAME_PREFIX-$POSTGRES_SERVICE pg_dump --dbname=postgres --username=postgres > $POSTGRES_DUMP_FILE
echo "postgres dumped"

## delete all environment variables in .env file
unset $(grep -v '^#' .env | sed -E 's/(.*)=.*/\1/' | xargs)

exit 0
