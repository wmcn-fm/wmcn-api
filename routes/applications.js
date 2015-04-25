var express = require('express');
var applications = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Applications = require('../models/Application');

//  for testing/development only:
var faker = require('../test/fake');


/**	==========
*
*	/applications
*
*/

//	GET all current applications in the table
applications.get('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
  	if (err) {
  		return res.json(500, {error: err});
  	}

  	Applications.getAllApps(client, function(err, result) {
  		done();

  		if (err) {
  			return res.json(500, {error: err});
  		} else {
			res.json(200, {applications: result});
		  // res.json(200, {shows: '/returns a list of all Applications'});
  		}

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
		var app = faker.makeRandomApp();
		console.log(app);
		Applications.addApp(client, app, function(err, result) {
			done();

			if (err) {
				res.json(500, err);
			} else {
				res.json(201, {"result": result.rowCount + " application created."});	
			}

			client.end();
		});	//	end app.add
	});	//	end pg.connect
});

//	PUT an update to all applications in the table
applications.put('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var updates = req.body.updates;
		Applications.updateAllApps(client, updates, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(200, {result: result});
				// res.json(200, {message: '/returns number of updated apps'});
			}

			client.end();
		});	//	end updateAllApps()
	});	//	end pg.connect
});

applications.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		Applications.deleteAllApps(client, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(204, result);
				// res.json(200, {message: '/returns the id of the deleted app'});
			}

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
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var id = req.params.id;
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
	// res.json(200, {application: '/returns ' + id + ' s updated application document'});
	res.json(500, {error: 'route not implemented!'});
});

applications.delete('/:id', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var id = req.params.id;
		Applications.deleteAppById(client, id, function(err, result) {
			done();

			if (!err && result) {
				res.json(200, {"result": "app " + id + " deleted." });
			} else if (!err) {
				res.json(404, {"error": "Couldn't find application with id\t" + id});
			} else {
				res.json(500, {error: err});
			}

			client.end();
		});
	});
});


module.exports = applications;