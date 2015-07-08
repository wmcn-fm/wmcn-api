var pg = require('pg')
var db = require('../config/config')().db;

var tables = [];

var users = "CREATE TABLE IF NOT EXISTS users ( \
              id serial PRIMARY KEY NOT NULL,\
              first_name varchar NOT NULL,\
              last_name varchar NOT NULL,\
              phone varchar(15) NOT NULL,\
              email varchar(320) NOT NULL UNIQUE,\
              hash varchar NOT NULL,\
              grad_year smallint,\
              mac_id int,\
              iclass int,\
              created timestamp DEFAULT current_timestamp)";

var shows = "CREATE TABLE IF NOT EXISTS shows ( \
              id serial NOT NULL UNIQUE, \
              title varchar NOT NULL,\
              blurb text NOT NULL,\
              created timestamp DEFAULT current_timestamp)";

var playlists = "CREATE TABLE IF NOT EXISTS playlists ( \
              id serial UNIQUE NOT NULL, \
              show_id int NOT NULL REFERENCES shows (id), \
              content text NOT NULL, \
              created timestamp DEFAULT current_timestamp)";

var applications = "CREATE TABLE IF NOT EXISTS applications ( \
                  id serial UNIQUE NOT NULL, \
                  first_name varchar[] NOT NULL, \
                  last_name varchar[] NOT NULL, \
                  phone varchar(15)[] NOT NULL, \
                  email varchar(320)[] NOT NULL, \
                  grad_year smallint[], \
                  mac_id int[], \
                  iclass int[], \
                  created timestamp DEFAULT current_timestamp, \
                  title varchar NOT NULL, \
                  blurb text NOT NULL, \
                  availability int[] NOT NULL, \
                  time_pref int, \
                  description text)";

var hosts = "CREATE TABLE IF NOT EXISTS hosts( \
              user_id int NOT NULL REFERENCES users (id),\
              show_id int NOT NULL REFERENCES shows (id))";

var schedule = "CREATE TABLE IF NOT EXISTS schedule( \
                timeslot int UNIQUE NOT NULL CHECK (0 <= timeslot AND timeslot <= 167), \
                show_id int NOT NULL REFERENCES shows (id))";

var articles = "CREATE TABLE IF NOT EXISTS articles( \
                id serial UNIQUE NOT NULL, \
                author_id serial NOT NULL REFERENCES users (id), \
                content text NOT NULL, \
                created timestamp DEFAULT current_timestamp)";

var tables = [users, shows, playlists, applications, hosts, schedule, articles];

console.log('Setting tables...')
pg.connect(db, function(err, client, done){
  if (err) throw err;

  tables.map(function(q) {
    client.query(q, function(err) {
      if (err) throw err;
      done();
    });
  });

  pg.end();
  console.log('Finished setting up tables')
});
