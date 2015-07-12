#!/usr/bin/env sh

echo "Creating database..."
psql -c 'create database wmcn_test;' -U postgres
echo "Initialized database"

node lib/setTables.js
