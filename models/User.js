var forEachAsync = require('forEachAsync').forEachAsync;
var Show = require('./Show');
var Users = {};
var utils = require('./utils/model-utils');

/**
  *
  * All user methods
  *
**/

//  GET all users in the table
//  @param private: if true, the client does not have a valid
//                  access token and the response filters out
//                  sensitive info (eg phone, hash, mac id, etc);
Users.getAllUsers = function(client, private, cb) {
  var query;
  if (private) {
    query = client.query("SELECT id, first_name, last_name, email, grad_year, created FROM users");
  } else {
    query = client.query("SELECT * FROM users");
  }

  query.on('error', function(err) {
    cb(err)
  })
  query.on('row', function(row, result) {
    result.addRow(row)
  })
  query.on('end', function(result) {
    cb(null, result.rows)
  })
}

//  DELETE all users in the table
Users.deleteAllUsers = function(client, cb) {
  var query = client.query("DELETE FROM users");

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

//  UPDATE all users in the table
//  @param "updates": a JSON object containing user table fields to be updated,
//                     along with a value to set for ALL users in the table
Users.updateAllUsers = function(client, updates, cb) {
  var updateString = 'SET ';

  //  iterate over the JSON object to create
  //  a string of updated fields and values to pass to the query
  for (var key in updates) {
    if (updates.hasOwnProperty(key)) {
      var update = key + " = " + updates[key] + ", ";
      updateString += update;
    }
  }

  var queryString = "UPDATE * FROM users " + updateString;
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
  * Single user methods
  *
**/

//  POST a new user to the table
Users.addUser = function(client, u, cb) {
  utils.getHash(null, function(err, pw, hash) {
    if (err) cb(err);
    var usrArr = [ u.first_name, u.last_name, u.phone, u.email,
                    hash, u.grad_year, u.mac_id, u.iclass ];
    var qStr = "INSERT INTO users(access, first_name, last_name, phone, email, \
                hash, grad_year, mac_id, iclass) VALUES(1, $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
    client.query(qStr, usrArr, function(err, result){
      if (err) return cb(err)
      cb(null, result);
    })
  });
}

//  GET one user from the table by their unique ID
Users.getUserById = function(client, user_id, cb) {
  var qStr = "SELECT * FROM users WHERE id = $1";
  client.query(qStr, [user_id], function(err, result){
    if (err) {
      return cb(err);
    } else {
      cb(null, result.rows);
    }
  });
}

//  GET one user from the table by their email
Users.getUserByEmail = function(client, email, cb) {
  var qStr = "SELECT * FROM users WHERE email = $1";
    client.query(qStr, [email], function(err, result){
    if (err) {
      cb(err);
    } else {
      cb(null, result.rows);
    }
  });
}

//  UPDATE one user from the table by their unique ID
Users.updateUserById = function(client, user_id, updates, cb) {
  var updateFields = '';
  var updateValues = '';

  //  iterate over the JSON object to create
  //  a string of updated fields and values to pass to the query
  for (var key in updates) {
    if (updates.hasOwnProperty(key)) {
      // var update = key + " = " + updates[key] + ", ";
      updateFields += key + ', ';
      updateValues += updates[key];
    }
  }

  //  FIX ME: no idea how to properly format this query...
  // var queryString = "UPDATE " + updateFields " FROM users " + updateString;

  client.query(queryString, [user_id], function(err, result) {
    if (err) {
      return cb(err);
    } else {
      cb(null, result);
    }
  });

}

//  DELETE one user from the table by their unique ID
Users.deleteUserById = function(client, user_id, cb) {
  var qStr = "DELETE FROM users WHERE id = $1";
  client.query(qStr, [user_id], function(err, result) {
    if (err) {
      return cb(err);
    } else {
      cb(null, result.rowCount);
    }
  });
}

Users.getShows = function(client, user_id, cb) {
  var query = "SELECT * FROM hosts WHERE user_id = $1";
  client.query(query, [user_id], function(err, result) {
    if (err) return cb(err);
    // cb(null, result.rows);

    var sids = [];
    for (var rel in result.rows) {
      sids.push(result.rows[rel].show_id);
    }

    var shows = [];
    forEachAsync(sids, function(next, show_id, i, array) {
      Show.getShowById(client, show_id, function(err, result) {
        if (err) return cb(err);

        shows.push(result[0]);
        next();
      });
    }).then(function() {
      cb(null, shows);
    });

  });
}

Users.getCurrentShows = function(client, user_id, cb) {
  var query = "SELECT * FROM hosts WHERE user_id = $1";

  //  get all shows a user has hosted
  client.query(query, [user_id], function(err ,result) {
    if (err) return cb(err);

    var sids = [];
    for (var rel in result.rows) {
      sids.push(result.rows[rel].show_id);
    }

    //  cross-match user's shows with current shows
    utils.sortCurrent(client, sids, function(err, currentShows) {
      if (err) return cb(err);
      return cb(null, currentShows);
    });
  });
}


//  staff

Users.getStaff = function(client, level, private, cb) {
  var query;
  if (private) {
    query = "SELECT id, access, first_name, last_name, email, grad_year, created FROM users WHERE users.access >= $1"
  } else {
    query = "SELECT * FROM users WHERE users.access >= $1";
  }

  if (!level) level = 1;

  client.query(query, [level], function(err, result) {
    if (err) return cb(err);
    if (!result.rows.length > 0) { cb(null, null);
    } else {
      cb(null, result.rows);
    }
  });
}

Users.editStaff = function(client, user_id, level, cb) {
  var query = "UPDATE users SET access = $1 WHERE id = $2 RETURNING *; "
  console.log('from promoteStaff: uid:\t%s\tlevel:\t%s', user_id, level);
  var values = [level, user_id];

  client.query(query, values, function(err, result) {
    if (err) return cb(err);
    if (!result.rows.length > 0) {
      cb(null, null);
    } else {
      cb(null, result.rows)
    }
  });
}


module.exports = Users;
