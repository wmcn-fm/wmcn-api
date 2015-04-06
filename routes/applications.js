var express = require('express');
var applications = express.Router();

//  require user methods and database connection
var Applications = require('../models/Application');
var pg = require('pg');
var db = require('../db-connect');

//  for testing/development only:
var makeRandomApp = require('../test/utils').makeRandomApp;

/**	==========
*
*	/applications
*
*/

//	GET all current applications in the table
applications.get('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
  	if (err) {
  		return res.json(500, err);
  	}

  	Applications.getAllApps(client, function(err, result) {
  		done();

  		if (err) {
  			return res.json(500, err);
  		}

  		res.json(200, result);
		  // res.json(200, {shows: '/returns a list of all Applications'});

  		client.end();
  	});	//	end Applications.getAllApps
  });	//	end pg.connect
});

//	POST a new application to the table
applications.post('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		// TODO: when POSTing is set up on the client, uncomment the line below instead of makeRandomApp()
		// var app = req.body.application;
		var app = makeRandomApp();

		Applications.addApp(client, app, function(err, result) {
			done();

			if (err) {
				return res.json(500, err);
			}

			res.json(201, {"result": result.rowCount + " user created."});

			client.end();
		});	//	end app.add
	});	//	end pg.connect
});

//	PUT an update to all applications in the table
applications.put('/', function(req, res) {
	var updates = req.body.updates;

	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		Applications.updateAllApps(client, updates, function(err, result) {
			done();

			if (err) {
				return res.json(500, err);
			}

			res.json(200, result);
			// res.json(200, {message: '/returns number of updated apps'});

			client.end();
		});	//	end updateAllApps()
	});	//	end pg.connect
});

applications.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		done();

		if (err) {
			return res.json(500, err);
		}

		Applications.deleteAllApps(client, function(err, result) {
			done();

			if (err) {
				return res.json(500, err);
			}

			res.json(200, result);
			[]	// res.json(200, {message: '/returns the id of the deleted app'});

			client.end();
		});	//	end deleteAllApps
	});	//	end pg.connect
});

/** ==========
*
*	/applications/:id
*
*/

applications.get('/:id', function(req, res) {
	var id = req.params.id;

	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		Applications.getAppById(client, id, function(err, result) {
			done();

			if (!err && result) {
				res.json(200, result);
			} else if (!err) {
				res.json(404, {"error": "Couldn't find app with id\t" + id});
			} else {
				res.json(500, err);
			}

			client.end();
		});
	});
});

//	TODO: decide whether this method is necessary, either implement or delete
applications.put('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {application: '/returns ' + id + ' s updated application document'});
});

applications.delete('/:id', function(req, res) {
	var id = req.params.id;
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, err);
		}

		Applications.deleteAppById(client, id, function(err, result) {
			done();

			if (!err && result) {
				res.json(200, {"result": "app " + id + " deleted." });
			} else if (!err) {
				res.json(404, {"error": "Couldn't find application with id\t" + id});
			} else {
				res.json(500, err);
			}

			client.end();
		});
	});
});

/** ==========
*
*	advanced routes
*
*/


//	TODO: do i need these routes? dont think so...
// applications.get('/active', function(req, res) {
// 	res.json(200, {message: '/returns a list of all active apps'});
// });

// applications.get('/:id/hosts', function(req, res) {
// 	var id = req.params.id;
// 	// res.json(200, {message: '/returns the user documents associated with ' + id + 's show'});
// });

module.exports = applications;