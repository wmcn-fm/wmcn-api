var express = require('express');
var users = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Users = require('../models/User');
var Shows = require('../models/Show');
var api = require('../models/api');
var utils = require('./utils/route-utils');
var auth = require('../lib/auth');
var timeout = require('connect-timeout');


users.route('/')

	//  GET all users
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if(err) {
				done();
				return res.json(500, {error: err});
			}

			if (!req.query.email) {
				var loggedIn = req.headers['x-access-token'];
				var restrictPrivate = !loggedIn;

				console.log(loggedIn, restrictPrivate);
				Users.getAllUsers(client, restrictPrivate, function(err, result) {
					done();

					if (err) {
						res.json(500, {error: err});
					} else if (result.length === 0) {
						res.json(404, {error: "No users found.", users: result});
					} else {
						res.json(200, {users: result});
					}
				}); //  end Users.getAllUsers
			} else {

				var email = req.query.email;
				Users.getUserByEmail(client, email, function(err, result) {
					done();

					if (!err && (result.length > 0) ) {
						res.json(200, {user: result[0]});
					} else if (!err) {
						res.json(404, {error: 'user ' + email + ' does not exist'});
					} else {
						res.json(500, {error: err});
					}

				});	//	end Users.get by email
			}
		}); //  end pg.connect
	})	//	end .get

	//  POST a new user
	.post(auth.requiresAccess(3), timeout('5s'), haltOnTimedout, function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				return res.json(500, {error: err});
			}

			var user = req.body.user;
			if (!user) {
				done();
				return res.json(400, {error: 'user object is ' + user});
			} else {
				var missingColumns = utils.hasMissingColumns(user, 'user');
				if (missingColumns) {
					done();
					return res.json(400, {error: missingColumns + ' field is missing'});
				}

				Users.addUser(client, user, function(err, result) {
					// console.log(err, result);
					done();

					if (err) {
						res.json(500, {error: err});
					} else {
						res.json(201,
							{
								"result": result.rowCount + " user created.",
								"new_user": result.rows[0]
							}
						);
					}

				});   //  end Users.addUser
			}
		}); //  end pg.connect
	})

	//	FIXE ME: test this route
	//  PUT all users
	.put(function(req, res) {
		res.json(501, {error: 'not configured'});
		// pg.connect(db, function(err, client, done) {
		// 	if (err) {
		// 		return res.json(500, {error: err});
		// 	}

		// 	var updates = req.body.updates;
		// 	Users.updateAllUsers(client, updates, function(err, result) {
		// 		done();

		// 		if (err) {
		// 			res.json(500, {error: err});
		// 		} else {
		// 			res.json(200, {result: result});
		// 		}

		// 		client.end();
		// 	});	//	end updateAllUsers
		// });	//	end pg.connect
	})	//	end .put

	//  DELETE all users
	.delete(auth.requiresAccess(4), function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			Users.deleteAllUsers(client, function(err, result) {
				done();

				if (err) {
					res.json(500, {error: err});
				} else {
					res.json(200, {result: "deleted " + result + " users"});
				}
			});  // end Users.delete
		}); //  end pg.connect
	});


users.route('/:id')
	//	GET one user
	//		@param id: integer, a user's ID number
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var user_id = req.params.id;
			Users.getUserById(client, user_id, function(err, result) {
				done();

				if (!err && result.length > 0) {
					res.json(200, {user: result[0]});
				} else if (result.length === 0) {
					res.json(404, {error: "user " + user_id + " doesn't exist"});
				} else {
					res.json(500, {error: err});
				}
			});
		});
	})
	//	PUT an update to one user
	//		@param id: a user's id number
	.put(auth.requiresAccess(1), function(req, res) {
		res.json(501, {error: 'not configured!'});
		// pg.connect(db, function(err, client, done) {
		// 	if (err) {
		// 		return res.json(500, {error: err});
		// 	}

		// 	var user_id = req.params.id;
		// 	var updates = req.body.updates;
		// 	Users.updateUserById(client, user_id, updates, function(err, result) {
		// 		done();

		// 		if (err) {
		// 			res.json(500, {error: err});
		// 		} else {
		// 			res.json(201, {result: result});
		// 			// res.json(200, {user: '/returns ' + id + ' s updated user document'});
		// 		}

		// 		client.end();
		// 	});
		// });
	})

	//	DELETE one user
	//		@param id: a user's ID number
	.delete(auth.requiresAccess(4), function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var user_id = req.params.id;
			api.get('/users/' + user_id, function(err, result, statusCode) {
				if (err) {
					done();
					return res.json(500, {error: err});
				} else if (!err && result && statusCode === 200) {
					Users.deleteUserById(client, user_id, function(err, result) {
						done();

						if (err) {
							res.json(500, {error: err});
						} else {
							res.json(200, {message: "deleted user " + user_id});
						}
					});	//	end Users.delete
				} else {
					done();
					return res.json(statusCode, result);
				}
			});	//end api.get
		});	//	end pg.connect
	});

users.route('/:id/shows')
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var user_id = req.params.id;
				Users.getShows(client, user_id, function(err, result) {
					done();
					if (!err && result.length > 0) {
						res.json(200, {shows: result});
					} else if (!err) {
						res.json(404, {error: "User " + user_id + " hasn't hosted any shows"});
					} else {
						res.json(500, {error: err});
					}
				});

		});	//	end pg.connect
	})	//	end .get

	.post(auth.requiresAccess(3), function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var user_id = req.params.id;
			var show_id = req.body.show_id;
			Shows.addHost(client, show_id, user_id, function(err, result) {
				done();

				if (!err && result) {
					res.json(201, {result: "Added user " + user_id + ' to show ' + show_id});
				} else if (!err) {
					res.json(404, {result: result});
				} else {
					res.json(500, {error: err.detail});
				}
			});	//	end Show.addHost
		});	//	end pg.connect
	})	//	end .post

	.delete(auth.requiresAccess(4), function(req, res) {
		pg.connect(db, function (err, client, done) {
      if (err) {
        done();
        return res.json(500, {error: err});
      }

			var user_id = req.params.id;
			var show_id = req.body.show_id;
			Shows.removeHost(client, show_id, user_id,  function(err, result) {
				done();

				if (err) {
					res.json(500, {error: err});
				} else {
					res.json(200, {result: "removed user " + user_id + " from show " + show_id});
				}
			});	//	end Show.removeHost
		});	//	end pg.connect

	});	//	end delete

users.route('/:id/shows/current')
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var user_id = req.params.id;
				Users.getCurrentShows(client, user_id, function(err, result) {
					done();

					if (!err && result) {
						res.json(200, {shows: result});
					} else if (!err) {
						res.json(404, {error: "User " + user_id + " doesn't currently host any shows"});
					} else {
						res.json(500, {error: err});
					}
				});
		});	//	end pg.connect
	})	//	end .get


function haltOnTimedout(req, res, next){
	if (!req.timedout) next();
}

module.exports = users;
