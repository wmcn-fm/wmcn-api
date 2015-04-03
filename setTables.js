var pg = require('pg')
var db = require('./db-connect');

pg.connect(db, function(err, client, done){

  if (err) throw err;

  var user = "CREATE TABLE IF NOT EXISTS users ( \
                id int PRIMARY KEY,\
                first_name varchar(80),\
                last_name varchar(80),\
                phone int,\
                email varchar(30),\
                hash varchar(24),\
                grad_year int,\
                mac_id int,\
                iclass int,\
                created date)";

  var show = "CREATE TABLE IF NOT EXISTS shows ( \
                id int PRIMARY KEY, \
                title varchar(80),\
                timeslot int[],\
                blurb varchar(160),\
                created date)";

  var playlist = "CREATE TABLE IF NOT EXISTS playlists ( \
                id int PRIMARY KEY, \
                content varchar(240), \
                created date)";

  var application = "CREATE TABLE IF NOT EXISTS applications ( \
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

  var assignShow = "CREATE TABLE IF NOT EXISTS assignShow( \
                rel_id int PRIMARY KEY,\
                user_id int,\
                show_id int)";

  var assignPlaylist = "CREATE TABLE IF NOT EXISTS assignPlaylist( \
                rel_id int PRIMARY KEY,\
                show_id,\
                playlist_id)";

  
  client.query(user, function(err, result){
    if (err) throw err
      console.log(result);
    done();
  });

  client.query(show, function(err, result){
    if (err) throw err
      console.log(result);
    done();
  });

  client.query(playlist, function(err, result){
    if (err) throw err
      console.log(result);
    done();
  });

  client.query(assignShow, function(err, result){
    if (err) throw err
      console.log(result);
    done();
  });

  client.query(assignPlaylist, function(err, result){
    if (err) throw err
      console.log(result);
    done();
  });

  client.query(application, function(err, result) {
    if (err) throw err;
    console.log(result);
    done();
  })

  pg.end();
});