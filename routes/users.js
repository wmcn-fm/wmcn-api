var express = require('express');
var users = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Users = require('../models/User');
var api = require('../models/api');
var utils = require('./route-utils');


users.route('/')

	//  GET all users
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if(err) {
				return res.json(500, {error: err});
			}

			if (!req.query.email) {
				Users.getAllUsers(client, function(err, result) {
					//call `done()` to release the client back to the pool
					done();

					if (err) {
						res.json(500, {error: err});
					} else if (result.length === 0) {
						res.json(404, {error: "No users found.", users: result});
					} else {
						res.json(200, {users: result});
					}

					client.end();
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
	.post(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				return res.json(500, {error: err});
			}

			var user = req.body.user;
			if (!user) {
				res.json(403, {error: 'user object is ' + user})
			} else {
				var missingColumns = utils.hasMissingColumns(user, 'user');
				if (missingColumns) {
					return res.json(403, {error: missingColumns + ' field is missing'});
				}

				api.get('/users?email=' + user.email, function(err, result, statusCode) {
					if (err) {
						return res.json(500, {error: err});
						done();
					//	if statusCode = 404, user doesn't exist
					}	else if (!err && result && statusCode === 404) {
						Users.addUser(client, user, function(err, result) {
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
					} else if (!err && result && statusCode === 200) {
						return res.json(403, {error: "user with email " + result.user.email + " already exists"});
						done();
					} else {
						return res.json(statusCode, result);
						done();
					}
				});	//	end api.get
			}
		}); //  end pg.connect
	})

	//	FIXE ME: test this route
	//  PUT all users
	.put(function(req, res) {
		res.json(500, {error: 'not configured'});
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
	.delete(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				return res.json(500, {error: err});
			}

			Users.deleteAllUsers(client, function(err, result) {
				done();

				if (err) {
					res.json(500, {error: err});
				} else {
					res.json(200, {result: "deleted " + result + " users"});
				}

				client.end();
			});  // end Users.delete
		}); //  end pg.connect
	});


users.route('/:id')
	//	GET one user
	//		@param id: integer, a user's ID number
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
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

				client.end();
			});
		});
	})
	//	PUT an update to one user
	//		@param id: a user's id number
	.put(function(req, res) {
		res.json(500, {error: 'not configured!'});
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
	.delete(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				return res.json(500, {error: err});
			}

			var user_id = req.params.id;
			api.get('/users/' + user_id, function(err, result, statusCode) {
				if (err) {
					return res.json(500, {error: err});
				} else if (!err && result && statusCode === 200) {
					Users.deleteUserById(client, user_id, function(err, result) {
						done();

						if (err) {
							res.json(500, {error: err});
						} else {

							//	FIX ME: why does the message not send even when the status code does
							//					and the action is completed?
							res.json(200, {message: "deleted user " + user_id});
						}

						client.end();
					});	//	end Users.delete
				} else {
					return res.json(statusCode, result);
				}
			});	//end api.get
		});	//	end pg.connect
	});


module.exports = users;
