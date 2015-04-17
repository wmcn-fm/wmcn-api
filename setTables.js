var pg = require('pg')
var db = require('./db');

var tables = [];

var users = "CREATE TABLE IF NOT EXISTS users ( \
              id serial PRIMARY KEY NOT NULL,\
              first_name varchar(80) NOT NULL,\
              last_name varchar(80) NOT NULL,\
              phone bigint NOT NULL,\
              email varchar(30) NOT NULL UNIQUE,\
              hash varchar(24),\
              grad_year int,\
              mac_id int,\
              iclass int,\
              created date NOT NULL)";

var shows = "CREATE TABLE IF NOT EXISTS shows ( \
              id serial NOT NULL UNIQUE, \
              title varchar(80) NOT NULL,\
              timeslot int[] NOT NULL,\
              blurb varchar(160) NOT NULL,\
              created date NOT NULL)";

var playlists = "CREATE TABLE IF NOT EXISTS playlists ( \
              id serial UNIQUE NOT NULL, \
              author_id serial NOT NULL, \
              content varchar(240) NOT NULL, \
              created date NOT NULL)";

var applications = "CREATE TABLE IF NOT EXISTS applications ( \
                  id serial UNIQUE NOT NULL, \
                  first_name int[] NOT NULL, \
                  last_name int[] NOT NULL, \
                  phone int[] NOT NULL, \
                  email varchar(30)[] NOT NULL, \
                  grad_year int[], \
                  mac_id int[], \
                  iclass int[], \
                  created date  NOT NULL, \
                  title varchar(80) NOT NULL, \
                  timeslot int[] NOT NULL, \
                  blurb varchar(160) NOT NULL, \
                  availability int[] NOT NULL, \
                  timePref int, \
                  description varchar(160))";

var hosts = "CREATE TABLE IF NOT EXISTS hosts( \
              user_id serial NOT NULL,\
              show_id serial NOT NULL)";

var authors = "CREATE TABLE IF NOT EXISTS authors( \
              show_id serial NOT NULL,\
              playlist_id serial NOT NULL)";

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