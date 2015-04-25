var express = require('express');
var playlists = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Playlists = require('../models/Playlist');
var api = require('../models/api');

//  for testing/development only:
var faker = require('../test/utils');


/**	==========
*
*	/playlists
*
*/

//	GET all playlists in the table
playlists.get('/', function(req, res) {
  pg.connect(db, function(err, client, done) {
  	if (err) {
  		return res.json(500, {error: err});
  	}

  	if (!req.query.limit) {

  		console.log('no req.quer!\t', req.query.limit)
	  	Playlists.getAllPlaylists(client, function(err, result) {
	  		done();

	  		if (err) {
	  			res.json(500, {error: err});
	  		} else {
	  			res.json(200, {playlists: result});
	  		}

	  		client.end();
	  	});	//	end Playlists.getAllPlaylists 		
  	} else {

  		console.log('req.query.limit=\t', req.query.limit);
  		var n = req.query.limit;
  		Playlists.getPlaylists(client, n, function(err, result) {
  			done();
  			res.send(result);

  			client.end();
  		});
  	}
  	
  });	//	end pg.connect
});

//	POST a new playlist to the table
playlists.post('/', function(req, res) {	
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var pl;
		if (process.env.NODE_ENV !== 'development') {
			pl = req.body.playlist;
		} else {
			pl = faker.makeRandomPlaylist();
			api.get('/users/', function(err, result, statusCode) {
				if (!err && result && statusCode === 200) {
					var ids = [];
					for (var i in result.users) {
						ids.push(result.users[i].id);
					}
					console.log('pl before setting:\t', pl);
					pl.author_id = ids[Math.floor(Math.random()*ids.length)];
					console.log('author_id after setting, inside loop:\t', pl.author_id);

					Playlists.addPlaylist(client, pl, function(err, result) {
						done();

						if (err) {
							return res.json(500, {error: err});
						} else {
							res.json(201, {result: result.rowCount + " playlist created."});
						}

						client.end();
					});	//	end pl.addPlaylist
				}
			});	//	end api.get
		}
		
	});	//	end pg.connect
});

//	PUT an update to every playlist in the table
playlists.put('/', function(req, res) {
	var updates = req.body.updates;

	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		Playlists.updateAllPlaylists(client, updates, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
				// res.json(200, {message: '/returns number of updated playlists'});
			} else {
				res.json(201, {result: result});
			}

			client.end();
		});	//	end updateAllPlaylists()
	});	//	end pg.connect
});

//	DELETE all playlists in the table
playlists.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		Playlists.deleteAllPlaylists(client, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
				// res.json(200, {message: '/returns the id of the deleted playlist'});
			} else {
				res.json(200, {result: result});
			}

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