#!/usr/bin/env sh

echo "Creating database..."
psql -c 'create database wmcn_test;' -U postgres
psql -c 'create database wmcn_production;' -U postgres
echo "Initialized database"

node lib/setTables.js
