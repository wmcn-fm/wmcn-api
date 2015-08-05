var express = require('express');
var applications = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Applications = require('../models/Application');
var utils = require('./utils/route-utils');


applications.route('/')

	//	GET all current applications in the table
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
	  	if (err) {
				done();
	  		return res.json(500, {error: err});
	  	}

	  	Applications.getAllApps(client, function(err, result) {
	  		done();

	  		if (!err && result) {
					res.json(200, {applications: result});
	  		} else if (!err) {
				  res.json(404, {error: 'No applications found', applications: [] });
	  		} else {
					res.json(500, {error: err.detail});
				}
	  	});	//	end Applications.getAllApps
	  });	//	end pg.connect
	})

	//	POST a new application to the table
	.post(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var app = req.body.app;
			if (!app) {
				done();
				return res.json(400, {error: 'app object is ' + app});
			} else {
				var missingColumns = utils.hasMissingColumns(app, 'app');
				var appOk = utils.appOk(app);
				if (missingColumns || !appOk) {
					done();
					return res.json(400, {error: 'Application is missing information'});
				}

				Applications.addApp(client, app, function(err, result) {
					done();

					if (err) {
						res.json(500, {error: err.detail});
					} else {
						res.json(201,
							{"result": result.rowCount + " application created",
								"new_app": result.rows[0]
							}
						);
					}
				});	//	end app.add
			}

		});	//	end pg.connect
	})

	//	PUT an update to all applications in the table
	.put(function(req, res) {
		res.json(501, {error: 'not configured'});
		// pg.connect(db, function(err, client, done) {
		// 	if (err) {
		// 		return res.json(500, {error: err});
		// 	}

		// 	var updates = req.body.updates;
		// 	Applications.updateAllApps(client, updates, function(err, result) {
		// 		done();

		// 		if (err) {
		// 			res.json(500, {error: err});
		// 		} else {
		// 			res.json(200, {result: result});
		// 			// res.json(200, {message: '/returns number of updated apps'});
		// 		}

		// 		client.end();
		// 	});	//	end updateAllApps()
		// });	//	end pg.connect
	})

	.delete(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				return res.json(500, {error: err});
			}

			Applications.deleteAllApps(client, function(err, result) {
				done();

				if (err) {
					res.json(500, {error: err.detail});
				} else {
					res.json(200,
						{result: "deleted "+result+ " applications",
							num_deleted: result
						}
					);
				}
			});	//	end deleteAllApps
		});	//	end pg.connect
	});

applications.route('/:id')
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var id = req.params.id;
			Applications.getAppById(client, id, function(err, result) {
				done();

				if (!err && result) {
					res.json(200, {application: result});
				} else if (!err) {
					res.json(404, {"error": "Couldn't find app with id " + id});
				} else {
					res.json(500, err);
				}
			});
		});
	})

	//	TODO: decide whether this method is necessary, either implement or delete
	.put(function(req, res) {
		var id = req.params.id;
		// res.json(200, {application: '/returns ' + id + ' s updated application document'});
		res.json(500, {error: 'route not implemented!'});
	})

	.delete(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var id = req.params.id;
			Applications.deleteAppById(client, id, function(err, result) {
				done();

				if (!err && result) {
					res.json(200, {"result": result + " app with id " + id + " deleted." });
				} else if (!err) {
					res.json(404, {"error": "Couldn't find application with id " + id});
				} else {
					res.json(500, {error: err});
				}
			});
		});
	});


applications.route('/:id/approve')
	.post(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var id = req.params.id;
			var ts = req.body.timeslot;
			Applications.getAppById(client, id, function(err, app) {
				if (err) {
					done();
					return res.json(500, {error: err});

				} else if (!err && !app) {
					done();
					return res.json(404, {error: "Couldn't find application with id " + id});

				} else {
					var appOk = utils.appOk(app, ts);
					if (!appOk) {
						done();
						return res.json(400, {error: "Application is missing required information. Please review"});
					} else {

						Applications.approveApp(client, app, ts, function(err, result) {
							done();
							if (!err && result) {
								res.json(201, {result: result});
							} else {
								res.json(500, {error: err});
							}
						});	//	end approveApp
					}
				}
			});	//	end getAppById
		});	//	end pg.connect
	});


module.exports = applications;
