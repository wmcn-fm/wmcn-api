var Show = {};

/**
	*
	*	All show methods
	*
**/

//	SELECT all shows in the table
Show.getAllShows = function(client, cb) {
	var query = client.query("SELECT * FROM shows");

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
	var query = client.query("DELETE * FROM shows");

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

/**
	*
	*	Single show methods
	*
**/

//	INSERT a new show to the table
//	@param "show": JSON object containing fields:
//		id: int, title: string, timeslot: int, blurb: string, created: date
Show.addShow = function (client, show, cb) {
	var showArr = [ show.id, show.title, show.timeslot, show.blurb, show.created];
	var qStr = "INSERT INTO shows(id, title, timeslot, blurb, created) \
							VALUES($1, $2, $3, $4, $5)";
	client.query(qStr, showArr, function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

Show.getShowById = function(client, show_id, cb) {
	var qStr = "SELECT id, title, timeslot, blurb, created FROM shows WHERE show_id = $1";
	client.query(qStr, [show_id], function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

//	TODO: add this method
Show.updateShowById = function(client, show_id, updates, cb) {

}

Show.deleteShowById = function(client, show_id, cb) {
	var qStr = "DELETE id, title, timeslot, blurb, created FROM shows WHERE show_id = $1";
	client.query(qStr, [show_id], function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

module.exports = Show;