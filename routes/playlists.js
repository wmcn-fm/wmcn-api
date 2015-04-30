var express = require('express');
var playlists = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Playlists = require('../models/Playlist');
var api = require('../models/api');

//  for testing/development only:
var faker = require('../test/fake');
var utils = require('../test/utils');

playlists.route('/')
	.get(function(req, res) {
	  pg.connect(db, function(err, client, done) {
	  	if (err) {
	  		return res.json(500, {error: err});
	  	}

	  	if (!req.query.limit) {
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

	  		var n = parseInt(req.query.limit);
	  		Playlists.getPlaylists(client, n, function(err, result) {
	  			done();
	  			
	  			if (err) {
	  				res.json(500, {error: err});
	  			} else {
	  				res.json(200, {playlists: result});
	  			}

	  			client.end();
	  		});
	  	}
	  	
	  });	//	end pg.connect
	})	//	end .get

	//	POST a new playlist to the table
	.post(function(req, res) {	
		pg.connect(db, function(err, client, done) {
			if (err) {
				return res.json(500, {error: err});
			}

			var pl;
			if (process.env.NODE_ENV === 'production') {
				pl = req.body.playlist;
				res.json(500, {error: 'not configured for production!!'});
			} else {
				pl = faker.makeRandomPlaylist();
				pl.show_id = req.body.fake_show_id;
			}

			Playlists.addPlaylist(client, pl, function(err, result) {
				done();

				if (err) {
					return res.json(500, {error: err});
				} else {
					res.json(201, {result: result.rowCount + " playlist created."});
				}

				client.end();
			});	//	end pl.addPlaylist

		});	//	end pg.connect
	})	//	end .post

	//	DELETE all playlists in the table
	.delete(function(req, res) {
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
	});	//	end .delete

playlists.route('/:id')
	//	GET one playlist by its id
	.get(function(req, res) {
		var id = req.params.id;

		pg.connect(db, function(err, client, done) {
			if (err) {
				return res.json(500, {error: err});
			}

			Playlists.getPlaylistById(client, id, function(err, result) {
				done();

				if (!err && result) {
					res.json(200, {playlist: result});
				} else if (!err) {
					res.json(404, {"error": "Couldn't find playlist with id\t" + id});
				} else {
					res.json(500, {error: err});
				}

				client.end();
			});	//	end getPlaylist
		});	//	end pg.connect
	})	//	end .get

	//	PUT one playlist by its id
	.put(function(req, res) {
		var id = req.params.id;
		res.json(500, {error: 'route not implemented'});
		//	TODO: implement this route
		// res.json(200, {playlist: '/returns ' + id + ' s updated playlist document'});
	})

	.delete(function(req, res) {
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
			});	//	end Playlists.delete
		});	//	end pg.connect
	});	//	end .delete


module.exports = playlists;