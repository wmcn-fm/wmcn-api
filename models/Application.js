var Apps = {};
var User = require('./User');
var Show = require('./Show');
var Schedule = require('./Schedule');
var forEachAsync = require('forEachAsync').forEachAsync;


/**
  *
  * All application methods
  *
**/

//  SELECT all apps in the table
Apps.getAllApps = function(client, cb) {
  var query = client.query("SELECT * FROM applications ORDER BY created DESC");

  query.on('error', function(err) {
    cb(err)
  });

  query.on('row', function(row, result) {
    result.addRow(row)
  });

  query.on('end', function(result) {
    if (!result.rows.length > 0) {
			cb(null, null);
		} else {
			cb(null, result.rows);
		}
  });
}

//  DELETE all apps in the table
Apps.deleteAllApps = function(client, cb) {
  var query = client.query("DELETE FROM applications");

  query.on('error', function(err) {
    cb(err);
  });

  query.on('row', function(row, result) {
    result.addRow(row);
  });

  query.on('end', function(result) {
    cb(null, result.rowCount);
  });
}

//  UPDATE all apps in the table
//  @param "updates": a JSON object containing app table fields to be updated,
//                     along with a value to set for ALL users in the table
Apps.updateAllApps = function(client, updates, cb) {
  var updateString = 'SET ';

  //  iterate over the JSON object to create
  //  a string of updated fields and values to pass to the query
  for (var key in updates) {
    if (updates.hasOwnProperty(key)) {
      var update = key + " = " + updates[key] + ", ";
      updateString += update;
    }
  }

  var queryString = "UPDATE * FROM applications " + updateString;
  var query = client.query(queryString);

  query.on('error', function(err) {
    cb(err);
  });

  //  TODO: is this line necessary? what does pgres return from an update?
  query.on('row', function(row, result) {
    result.addRow(row);
  });

  query.on('end', function(result) {

    //  TODO: is .length the proper call?
    cb(null, result.rows.length);
  });
}


/**
  *
  * Single app methods
  *
**/

//  INSERT a new app to the table
//  @param "a": JSON object containing fields:
//      id: int, first_name: string[], last_name: string[],
//      email: string[], grad_year: int[], mac_id: int[],
//      iclass: int[], created: date, title: string, timeslot: int,
//      blurb: string, availability: int[], time_pref: int, description: string
Apps.addApp = function(client, a, cb) {
  var appArr = [ a.first_name, a.last_name, a.phone, a.email,
                  a.grad_year, a.mac_id, a.iclass,
                  a.title, a.blurb, a.availability,
                  a.time_pref, a.description ];
  var qStr = "INSERT INTO applications(first_name, last_name, phone, email, \
              grad_year, mac_id, iclass, title, blurb, \
              availability, time_pref, description) VALUES($1, $2, $3, $4, $5, \
               $6, $7, $8, $9, $10, $11, $12) RETURNING *";
  client.query(qStr, appArr, function(err, result){
    if (err) return cb(err);
    cb(null, result);
  });
}

//  SELECT one app from the table by their id
//  @param "app_id": application's unique id
Apps.getAppById = function(client, app_id, cb) {
  var qStr = "SELECT * FROM applications WHERE id = $1";
  client.query(qStr, [app_id], function(err, result){
    if (err) {
      return cb(err);
    } else {
      if (!result.rows.length > 0) {
  			cb(null, null);
  		} else {
  			cb(null, result.rows[0]);
  		}
    }
  });
}

//  TODO: add this method

//  UPDATE one user from the table by their unique ID
Apps.updateAppById = function(client, app_id, updates, cb) {
}

//  DELETE one user from the table by their unique ID
Apps.deleteAppById = function(client, app_id, cb) {
  var qStr = "DELETE FROM applications WHERE id = $1";
  client.query(qStr, [app_id], function(err, result) {
    if (err) {
      return cb(err);
    } else {
      cb(null, result.rowCount);
    }
  });
}

Apps.approveApp = function(client, app, ts, cb) {
  var userFields = ['first_name', 'last_name', 'phone', 'email',
                    'grad_year', 'mac_id', 'iclass'];
  var showFields = ['title', 'blurb'];
  var userInfo = [];
  var showInfo = {};
  var numUsers = app.email.length;

  //  parse user arrays into an array of JSON objs, one per user
  for (var i=0; i<numUsers; i++) {
    userInfo[i] = {};
    for (var f in userFields) {
      var field = userFields[f];
      userInfo[i][field] = app[field][i];
    }
  }
  for (var f in showFields) {
    var field = showFields[f];
    showInfo[field] = app[field];
  }

  var res = {};
  res.users = [];
  res.show;
  res.num_hosts = 0;
  res.timeslot = null;

  //  add users
  forEachAsync(userInfo, function(next, usr, i, arr) {
    User.addUser(client, usr, function(err, result) {

      //  if the user already exists, find them and add them to res.users
      //  so they will still be added to the show as hosts even though they
      //  dont' need to be added to the users table
      if (err) {
        var detail = err.detail;
        var start = detail.slice(0, 13);
        var end = detail.slice(-17, -1);
        var alreadyExists = start + usr.email + end + '.';
        if (detail === alreadyExists) {
          User.getUserByEmail(client, usr.email, function(err, result) {
            if (err) return cb(err);
            if (result[0].hasOwnProperty('id')) res.users.push(result[0]);
            next();
          }); //  end getUserByEmail
        } else {
          return cb(err);
        }
      } else {
        res.users.push(result.rows[0]);
        next();
      }
    });
  }).then(function() {

    //  add show
    Show.addShow(client, showInfo, function(err ,result) {
      if (err) return cb(err);
      res.show = result.rows[0];

      //  add hosts
      forEachAsync(res.users, function(next, user, i ,arr) {
        Show.addHost(client, res.show.id, user.id, function(err, result) {
          if (err) return cb(err);
          res.num_hosts += result.rowCount;
          next();
        });
      }).then(function() {

        //  post to schedule
        var slot = {timeslot: ts, show_id: res.show.id};
        console.log(slot);
        Schedule.scheduleShow(client, slot, function(err, result) {
          if (err) return cb(err);
          res.timeslot = result;

          //  delete application
          Apps.deleteAppById(client, app.id, function(err ,result) {
            if (err) return cb(err);
            cb(null, res);
          }); //  end deleteAppById
        }); //  end scheduleShow
      });
    }); //  end addShow
  });
}




module.exports = Apps;
