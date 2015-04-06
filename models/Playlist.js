var Playlist = {};

/**
	*
	*	All playlist methods
	*
**/

//	SELECT all playlists in the table
Playlist.getAllPlaylists = function(client, cb) {
	var query = client.query("SELECT * FROM playlists");

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
	var query = client.query("DELETE * FROM playlists");

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
	*	Single playlist methods
	*
**/

//	INSERT a new playlist to the table
//	@param "pl": JSON object containing fields:
//		id: int, content: string, created: date
Playlist.addPlaylist = function (client, pl, cb) {
	var plArr = [ pl.id, pl.content, pl.created];
	var qStr = "INSERT INTO playlists(id, content, created) \
							VALUES($1, $2, $3)";
	client.query(qStr, plArr, function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

Playlist.getPlaylistById = function(client, playlist_id, cb) {
	var qStr = "SELECT id, content, created FROM playlists WHERE id = $1";
	client.query(qStr, [playlist_id], function(err, result) {
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
	var qStr = "DELETE FROM playlists WHERE id = $1";
	client.query(qStr, [playlist_id], function(err, result) {
		if (err) {
			return cb(err);
		} else {
			cb(null, result);
		}
	});
}

module.exports = Playlist;