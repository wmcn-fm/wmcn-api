var Playlist = {};

/**
	*
	*	All playlist methods
	*
**/

//	SELECT all playlists in the table
Playlist.getAllPlaylists = function(client, cb) {
	var query = client.query("SELECT * FROM playlists ORDER BY created DESC");

	query.on('error', function(err) {
		cb(err);
	});

	query.on('row', function(row, result) {
		result.addRow(row);
	});

	query.on('end', function(result) {
		if (!result.rows.length > 0) {
			cb(null, null);
		} else {
			cb(null, result.rows);
		}
	});
}

//  UPDATE all playlists in the table
//  @param "updates": a JSON object containing playlist table fields to be updated,
//                     along with a value to set for ALL playlists in the table
Playlist.updateAllPlaylists = function(client, updates, cb) {
	var updateString = 'SET ';

  //  iterate over the JSON object to create
  //  a string of updated fields and values to pass to the query
  for (var key in updates) {
    if (updates.hasOwnProperty(key)) {
      var update = key + " = " + updates[key] + ", ";
      updateString += update;
    }
  }

  var queryString = "UPDATE * FROM playlists " + updateString;
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

//	DELETE all playlists in the table
Playlist.deleteAllPlaylists = function(client, cb) {
	var query = client.query("DELETE FROM playlists");

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

Playlist.getPlaylists = function(client, n, cb) {
  var query = "SELECT * FROM playlists ORDER BY created DESC LIMIT $1";
  var limit = [parseInt(n)];
  client.query(query, limit, function(err, result) {
    if (err) {
      return cb(err);
    } else {
      cb(null, result.rows);
    }
  });
}

/**
	*
	*	Single playlist methods
	*
**/

//	INSERT a new playlist to the table
//	@param "pl": JSON object containing fields:
//		id: int, content: string, created: date
Playlist.addPlaylist = function (client, pl, cb) {
	var values = [ parseInt(pl.show_id), pl.content];
	var query = "INSERT INTO playlists(show_id, content) \
							VALUES($1, $2) RETURNING *";
	client.query(query, values, function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

Playlist.getPlaylistById = function(client, playlist_id, cb) {
	var query = "SELECT * FROM playlists WHERE id = $1";
  var values = [parseInt(playlist_id)];
	client.query(query, values, function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result.rows[0]);
		}
	});
}

//	TODO: add this method
Playlist.updatePlaylistById = function(client, playlist_id, updates, cb) {

}

Playlist.deletePlaylistById = function(client, playlist_id, cb) {
	var query = "DELETE FROM playlists WHERE id = $1";
  var values = [parseInt(playlist_id)];
	client.query(query, values, function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

module.exports = Playlist;
