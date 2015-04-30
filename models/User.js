var sql = require('sql');
var Users = {};

/**
  *
  * All user methods
  *
**/

//  GET all users in the table
Users.getAllUsers = function(client, cb) {
  var query = client.query("SELECT * FROM users");
  
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
  var usrArr = [ u.first_name, u.last_name, u.phone, u.email,
                  u.hash, u.grad_year, u.mac_id, u.iclass ];
  var qStr = "INSERT INTO users(first_name, last_name, phone, email, \
              hash, grad_year, mac_id, iclass) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
  client.query(qStr, usrArr, function(err, result){
    if (err) return cb(err)
    cb(null, result)
  })
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




module.exports = Users;