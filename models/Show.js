var forEachAsync = require('forEachAsync').forEachAsync;
var User = require('./User');
var Show = {};


/**
	*
	*	All show methods
	*
**/

//	SELECT all shows in the table
Show.getAllShows = function(client, cb) {
	var query = client.query("SELECT * FROM shows ORDER BY created DESC");

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

//  UPDATE all shows in the table
//  @param "updates": a JSON object containing show table fields to be updated,
//                     along with a value to set for ALL shows in the table
Show.updateAllShows = function(client, updates, cb) {
	var updateString = 'SET ';

  //  iterate over the JSON object to create
  //  a string of updated fields and values to pass to the query
  for (var key in updates) {
    if (updates.hasOwnProperty(key)) {
      var update = key + " = " + updates[key] + ", ";
      updateString += update;
    }
  }

  var queryString = "UPDATE * FROM shows " + updateString;
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

//	DELETE all shows in the table
Show.deleteAllShows = function(client, cb) {
	var query = client.query("DELETE FROM shows");

  query.on('error', function(err) {
    cb(err);
  });

  query.on('row', function(row, result) {
    result.addRow(row);
  });

  query.on('end', function(result) {
    cb(null, result);
  });
}

/**
	*
	*	Single show methods
	*
**/

//	INSERT a new show to the table
//	@param "show": JSON object containing fields:
//		title: string, timeslot: int, blurb: string, created: date
Show.addShow = function (client, show, cb) {
	var showArr = [ show.title, show.blurb, ];
	var qStr = "INSERT INTO shows(title, blurb) \
							VALUES($1, $2) RETURNING *";
	client.query(qStr, showArr, function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

Show.getShowById = function(client, show_id, cb) {
	var qStr = "SELECT * FROM shows WHERE id = $1";
	client.query(qStr, [show_id], function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result.rows);
		}
	});
}

Show.getAllPlaylists = function(client, show_id, cb) {
  var query = "SELECT * FROM playlists WHERE show_id = $1 ORDER BY created DESC";
  var values = [show_id];
  // if (limit !== undefined) {
  //   query += " LIMIT $2";
  //   values.push(limit);
  // }

  client.query(query, values, function(err, result) {
    if (err) {
      cb(err);
    } else {
      cb(null, result.rows);
    }
  });
}

Show.getPlaylists = function(client, show_id, limit, cb) {
  var query = "SELECT * FROM playlists WHERE show_id = $1 ORDER BY created DESC LIMIT $2";
  var values = [show_id, limit];

  client.query(query, values, function(err, result) {
    if (err) {
      cb(err);
    } else {
      cb(null, result.rows);
    }
  });
}

//	TODO: add this method
//	UPDATE one show from the table by its id
Show.updateShowById = function(client, show_id, updates, cb) {

}

//	DELETE one show from the table by its id
Show.deleteShowById = function(client, show_id, cb) {
	var qStr = "DELETE FROM shows WHERE id = $1";
	client.query(qStr, [show_id], function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

/**
	*
	*	Advanced methods
	*
**/

Show.getPlaylists = function(client, show_id, limit, cb) {
	if (!limit) {
		limit = 10000;
	}
	var query = "SELECT * FROM playlists WHERE show_id = $1 ORDER BY created DESC LIMIT $2";
	client.query(query, [show_id, limit], function(err ,result) {
		if (err) return cb(err);

		if (!result.rows.length > 0) {
			cb(null, null)
		} else {
			cb(null, result.rows);
		}
	});
}

//	SELECT a list of currently active shows
//	(ie, 0 <= show.timeslot <= 167)
Show.getActiveShows = function(client, cb) {

	//	FIX ME: query currently calls only shows where show.timeslot === 167
	//	see: http://stackoverflow.com/questions/16606357/if-array-contains-value
	var qStr = "SELECT * FROM shows \
				WHERE timeslot && array(SELECT generate_series(0, 167))";
	var query = client.query(qStr);

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

//	TODO: adjust this method to append rows to the result
//				rather than just returning the first result

//	SELECT users attached to a given show_id
Show.getHosts = function(client, show_id, cb) {
	var qStr = "SELECT * FROM hosts WHERE show_id = $1";
	client.query(qStr, [show_id], function(err, result) {
		if (err) {
			return cb(err);
		} else {

      var uids = [];
      for (var rel in result.rows) {
        uids.push(result.rows[rel].user_id);
      }

      var users = [];
      forEachAsync(uids, function(next, user_id, i, array) {
				client.query("SELECT * FROM users WHERE id = $1", [user_id], function(err, result) {
					if (err) {
            return cb(err);
          } else {
            users.push(result.rows[0]);
            next();
          }
				});
      }).then(function() {
        cb(null, users);
      });

		}
	});  //  end client.query
}

Show.deleteAllHosts = function(client, cb) {
	var query = client.query("DELETE FROM hosts");

  query.on('error', function(err) {
    cb(err);
  });

  query.on('row', function(row, result) {
    result.addRow(row);
  });

  query.on('end', function(result) {
    cb(null, result);
  });
}

Show.addHost = function(client, show_id, host_id, cb) {
  var query = "INSERT INTO hosts(show_id, user_id) VALUES ($1, $2)";
  var values = [show_id, host_id];
  client.query(query, values, function(err, result) {
    if (err) return cb(err);
    cb(null, result);
  });
}

Show.removeHost = function(client, show_id, host_id, cb) {
  var query = "DELETE FROM hosts WHERE show_id = $1 AND user_id = $2";
  var values = [show_id, host_id];
  client.query(query, values, function(err, result) {
    if (err) return cb(err);
    cb(null, result);
  });
}

Show.getAllHosts = function(client, cb) {
  var query = "SELECT * FROM hosts";
  client.query(query, function(err, result) {
    if (err) return cb(err);
    cb(null, result.rows);
  });
}

//	TODO: add additional logic to return -1 if the
//	query generates no error AND no show (e.g., during
	// the summer or middle ofthe night)
Show.getShowByTimeslot = function(client, timeslot, cb) {
	var qStr = "SELECT * FROM shows WHERE timeslot = $1";
	client.query(qStr, [timeslot], function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}


/**
	*
	*	Utility functions
	*
**/

//	TODO: test to make sure this function works,
//	both in terms of addition logic and relative
//	to timezones
var getCurrentTimeslot = function getCurrentTimeslot() {
	var d = new Date();
	var day = d.getDay();
	var hour = d.getHours();
	var timeslot = day + (hour * day);

	return timeslot;
}

///////////////////////

module.exports.getCurrentTimeslot = getCurrentTimeslot;
module.exports = Show;
