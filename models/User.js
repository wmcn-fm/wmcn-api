var Users = {};

/**
  *
  * User methods:
  *
**/

Users.addUser = function(client, u, cb) {
  var usrArr = [ u.id, u.first_name, u.last_name, u.email,
                  u.hash, u.grad_year, u.mac_id, u.iclass, u.created ];
  var qStr = "INSERT INTO users(user_id, first_name, last_name, email, \
              hash, grad_year, mac_id, iclass, created) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)";
  client.query(qStr, usrArr, function(err, result){
    if (err) return cb(err)
    cb(null, result)
  })
}

Users.getUserById = function(client, user_id, cb) {
  var qStr = "SELECT user_id, name, email FROM users WHERE user_id = $1";
  client.query(qStr, [user_id], function(err, result){
      console.log('error from within pg method:\t', err);
    if (err) {
      return cb(err);
    } else {
      cb(null, result);
    }  
  });
}

Users.getAllUsers = function(client, cb) {
  var query = client.query("SELECT * FROM users")
  
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


module.exports = Users;