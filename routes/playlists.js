var express = require('express');
var playlists = express.Router();

//  require user methods and database connection
var Playlists = require('../models/Playlist');
var pg = require('pg');
var db = require('../db-connect');

//  for testing/development only:
var makeRandomPlaylist = require('../test/utils').makeRandomPlaylist;

/**	==========
*
*	/playlists
*
*/

//	GET all playlists in the table
playlists.get('/', function(req, res) {
  pg.connect(db, function(err, client, done) {
  	if (err) {
  		return res.json(500, err);
  	}

  	Playlists.getAllPlaylists(client, function(err, result) {
  		done();

  		if (err) {
  			return res.json(500, err);
  		}

  		res.json(200, result);
		  // res.json(200, {shows: '/returns a list of all playlists'});

  		client.end();
  	});	//	end Playlists.getAllPlaylists
  });	//	end pg.connect
});

//	POST a new playlist to the table
playlists.post('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		// TODO: when POSTing is set up on the client, uncomment the line below instead of makeRandomPlaylist()
		// var usrObj = req.body.user;
		var pl = makeRandomPlaylist();

		Playlists.addPlaylist(client, pl, function(err, result) {
			done();

			if (err) {
				return res.json(500, err);
			}

			res.json(201, {"result": result.rowCount + " user created."});

			client.end();
		});	//	end pl.addPlaylist
	});	//	end pg.connect
});

//	PUT an update to every playlist in the table
playlists.put('/', function(req, res) {
	var updates = req.body.updates;

	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		Playlists.updateAllPlaylists(client, updates, function(err, result) {
			done();

			if (err) {
				return res.json(500, err);
				// res.json(200, {message: '/returns number of updated playlists'});
			}

			res.json(200, result);
			client.end();
		});	//	end updateAllPlaylists()
	});	//	end pg.connect
});

//	DELETE all playlists in the table
playlists.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		done();

		if (err) {
			return res.json(500, err);
		}

		Playlists.deleteAllPlaylists(client, function(err, result) {
			done();

			if (err) {
				return res.json(500, err);
				// res.json(200, {message: '/returns the id of the deleted playlist'});
			}

			res.json(200, result);
			client.end();
		});	//	end deleteAllPlaylists
	});	//	end pg.connect
});

/** ==========
*
*	/playlists/:id
*
*/

//	GET one playlist by its id
playlists.get('/:id', function(req, res) {
	var id = req.params.id;

	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		Playlists.getPlaylistById(client, id, function(err, result) {
			done();

			if (!err && result) {
				res.json(200, result);
			} else if (!err) {
				res.json(404, {"error": "Couldn't find playlist with id\t" + id});
			} else {
				res.json(500, err);
			}

			client.end();
		});
	});
});

//	PUT one playlist by its id
playlists.put('/:id', function(req, res) {
	var id = req.params.id;

	//	TODO: implement this route
	// res.json(200, {playlist: '/returns ' + id + ' s updated playlist document'});
});

playlists.delete('/:id', function(req, res) {
	var id = req.params.id;

	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		Playlists.deletePlaylistById(client, id, function(err, result) {
			done();

			if (!err && result) {
				res.json(200, {"result": "Playlist " + id + " deleted." });
				// res.json(200, {message: '/returns the id of the deleted playlist: ' + id});
			} else if (!err) {
				res.json(404, {"error": "Couldn't find playlist with id\t" + id});
			} else {
				res.json(500, err);
			}

			client.end();
		});
	});
});

module.exports = playlists;