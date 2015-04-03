var Apps = {};

/**
  *
  * All application methods
  *
**/

//  SELECT all apps in the table
Apps.getAllApps = function(client, cb) {
  var query = client.query("SELECT * FROM applications");
  
  query.on('error', function(err) {
    cb(err)
  });

  query.on('row', function(row, result) {
    result.addRow(row)
  });

  query.on('end', function(result) {
    cb(null, result.rows)
  });
}

//  DELETE all apps in the table
Apps.deleteAllApps = function(client, cb) {
  var query = client.query("DELETE * FROM applications");

  query.on('error', function(err) {
    cb(err);
  });

  query.on('row', function(row, result) {
    result.addRow(row);
  });

  query.on('end', function(result) {
    cb(null, result.rows);
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
//      blurb: string, availability: int[], timePref: int, description: string 
Apps.addApp = function(client, a, cb) {
  var appArr = [ a.id, a.first_name, a.last_name, a.email,
                  a.grad_year, a.mac_id, a.iclass, a.created,
                  a.title, a.timeslot, a.blurb, a.availability,
                  a.timePref, a.description ];
  var qStr = "INSERT INTO applications(id, first_name, last_name, email, \
              grad_year, mac_id, iclass, created, title, timeslot, blurb, \
              availability, timePref, description) VALUES($1, $2, $3, $4, $5, \
               $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)";
  client.query(qStr, appArr, function(err, result){
    if (err) return cb(err)
    cb(null, result)
  })
}

//  SELECT one app from the table by their id
//  @param "app_id": application's unique id
Apps.getAppById = function(client, app_id, cb) {
  var qStr = "SELECT id, first_name, last_name, email, \
              grad_year, mac_id, iclass, created, title, timeslot, blurb, \
              availability, timePref, description \
              FROM applications WHERE id = $1";
  client.query(qStr, [app_id], function(err, result){
      console.log('error from within pg method:\t', err);
    if (err) {
      return cb(err);
    } else {
      cb(null, result);
    }  
  });
}

//  TODO: add this method

//  UPDATE one user from the table by their unique ID
Apps.updateAppById = function(client, app_id, updates, cb) {
}

//  DELETE one user from the table by their unique ID
Apps.deleteAppById = function(client, app_id, cb) {
  var qStr = "DELETE id, first_name, last_name, email, \
              grad_year, mac_id, iclass, created, title, timeslot, blurb, \
              availability, timePref, description \
              FROM applications WHERE app_id = $1";
  client.query(qStr, [app_id], function(err, result) {
    if (err) {
      return cb(err);
    } else {
      cb(null, result);
    }
  });
}




module.exports = Users;