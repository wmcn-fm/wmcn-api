var pg = require('pg')
var db = require('../config/config')().db;
var forEachAsync = require('forEachAsync').forEachAsync;

console.log('heres the db:\n\n%s', db);

var tables = [];

var users = "CREATE TABLE IF NOT EXISTS users ( \
              id serial PRIMARY KEY NOT NULL,\
              access smallint NOT NULL,\
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
              id serial PRIMARY KEY NOT NULL UNIQUE, \
              title varchar NOT NULL UNIQUE,\
              blurb text NOT NULL,\
              created timestamp DEFAULT current_timestamp)";

var playlists = "CREATE TABLE IF NOT EXISTS playlists ( \
              id serial PRIMARY KEY NOT NULL UNIQUE, \
              show_id int NOT NULL REFERENCES shows (id), \
              content text NOT NULL, \
              created timestamp DEFAULT current_timestamp)";

var applications = "CREATE TABLE IF NOT EXISTS applications ( \
                  id serial PRIMARY KEY UNIQUE NOT NULL, \
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

var tables = [users, shows, playlists, applications, hosts, schedule];

console.log('Setting tables...')
pg.connect(db, function(err, client, done){
  if (err) throw err;

  forEachAsync(tables, function(next, query, i, arr) {
    console.log(query);
    client.query(query, function(err) {
      done();
      if (err) throw err;
      next();
    })
  }).then( function() {
    console.log('Finished setting up tables');
    pg.end();
  });
});
