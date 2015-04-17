var pg = require('pg')
var db = require('./db');

var tables = [];

var users = "CREATE TABLE IF NOT EXISTS users ( \
              id int PRIMARY KEY,\
              first_name varchar(80),\
              last_name varchar(80),\
              phone bigint,\
              email varchar(30),\
              hash varchar(24),\
              grad_year int,\
              mac_id int,\
              iclass int,\
              created date)";

var shows = "CREATE TABLE IF NOT EXISTS shows ( \
              id int PRIMARY KEY, \
              title varchar(80),\
              timeslot int[],\
              blurb varchar(160),\
              created date)";

var playlists = "CREATE TABLE IF NOT EXISTS playlists ( \
              id int PRIMARY KEY, \
              content varchar(240), \
              created date)";

var applications = "CREATE TABLE IF NOT EXISTS applications ( \
                  id int PRIMARY KEY, \
                  first_name int[], \
                  last_name int[], \
                  phone int[], \
                  email varchar(30)[], \
                  grad_year int[], \
                  mac_id int[], \
                  iclass int[], \
                  created date, \
                  title varchar(80), \
                  timeslot int[], \
                  blurb varchar(160), \
                  availability int[], \
                  timePref int, \
                  description varchar(160))";

var hosts = "CREATE TABLE IF NOT EXISTS hosts( \
              user_id int,\
              show_id int)";

var authors = "CREATE TABLE IF NOT EXISTS authors( \
              show_id int,\
              playlist_id int)";

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