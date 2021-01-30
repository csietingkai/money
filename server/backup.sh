#!/bin/bash

REDIS_PACKAGES=redis-tools
MONGO_PACKAGES=mongo-tools
POSTGRES_PACKAGES=postgresql-client-11\ postgresql-client-common
# MYSQL_PACKAGES=mysql-client-5.7

sudo apt-get install -y $REDIS_PACKAGES $MONGO_PACKAGES $POSTGRES_PACKAGES # $MYSQL_PACKAGES

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
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
REDIS_CLI=/usr/bin/redis-cli
REDIS_DUMP_FILE=$BACKUP_DIR/redis-dump-$TIMESTAMP.rdb
$REDIS_CLI -h $HOST -p $REDIS_PORT -a $REDIS_ROOT_PASSWORD --rdb $REDIS_DUMP_FILE
echo "redis dumped"

## backup mongodb
MONGO_CLI=/usr/bin/mongodump
MONGO_DUMP_FILE=$BACKUP_DIR/mongo-dump-$TIMESTAMP.archive
$MONGO_CLI -h $HOST --username $MONGODB_ROOT_USERNAME --password $MONGODB_ROOT_PASSWORD --authenticationDatabase=admin --forceTableScan --archive=$MONGO_DUMP_FILE
echo "mongodb dumped"

## backup postgres
POSTGRES_CLI=/usr/bin/pg_dumpall
POSTGRES_DUMP_FILE=$BACKUP_DIR/postgres-dump-$TIMESTAMP.sql
$POSTGRES_CLI -h $HOST -p $POSTGRES_PORT -U postgres > $POSTGRES_DUMP_FILE
echo "postgres dumped"

## backup mysql
#MYSQL_CLI=/usr/bin/mysqldump
#MYSQL_DUMP_FILE=$BACKUP_DIR/mysql-dump-$TIMESTAMP.sql
#$MYSQL_CLI -h $HOST -P $MYSQL_PORT -u root -p $MYSQL_ROOT_PASSWORD --all-databases > $MYSQL_DUMP_FILE
#echo "mysql dumped"

## delete all environment variables in .env file
unset $(grep -v '^#' .env | sed -E 's/(.*)=.*/\1/' | xargs)

exit 0
