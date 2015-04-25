var pg = require('pg')
var db = require('../config/config')().db;

var tables = [];

var users = "CREATE TABLE IF NOT EXISTS users ( \
              id serial PRIMARY KEY NOT NULL,\
              first_name varchar NOT NULL,\
              last_name varchar NOT NULL,\
              phone varchar(15) NOT NULL,\
              email varchar(320) NOT NULL UNIQUE,\
              hash varchar,\
              grad_year smallint,\
              mac_id int,\
              iclass int,\
              created timestamp DEFAULT current_timestamp)";

var shows = "CREATE TABLE IF NOT EXISTS shows ( \
              id serial NOT NULL UNIQUE, \
              title varchar NOT NULL,\
              timeslot int[] NOT NULL,\
              blurb text NOT NULL,\
              created timestamp DEFAULT current_timestamp)";

var playlists = "CREATE TABLE IF NOT EXISTS playlists ( \
              id serial UNIQUE NOT NULL, \
              author_id int REFERENCES users (id), \
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

var authors = "CREATE TABLE IF NOT EXISTS authors( \
              show_id int NOT NULL REFERENCES shows (id),\
              playlist_id int NOT NULL REFERENCES playlists (id))";

// var tables = [users, shows, playlists, applications, hosts, authors];

pg.connect(db, function(err, client, done){

  if (err) throw err;

  
  client.query(users, function(err, result){
    if (err) throw err;
      console.log(result);
  });

  client.query(shows, function(err, result){
    if (err) throw err;
      console.log(result);
  });

  client.query(playlists, function(err, result){
    if (err) throw err;
      console.log(result);
  });

  client.query(hosts, function(err, result){
    if (err) throw err;
      console.log(result);
  });

  client.query(authors, function(err, result){
    if (err) throw err;
      console.log(result);
  });

  client.query(applications, function(err, result) {
    if (err) throw err;
    console.log(result);
    done();
  })

  pg.end();
});