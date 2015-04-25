var express = require('express');
var users = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Users = require('../models/User');
var api = require('../models/api');

//  for testing/development only:
var faker = require('../test/utils');


/**	==========
*
*	/users
*
*/

//  GET all users
users.get('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if(err) {
			return res.json(500, {error: err});
		}

		Users.getAllUsers(client, function(err, result) {
			//call `done()` to release the client back to the pool
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(200, {users: result});	
			}

			client.end();
		}); //  end Users.getAllUsers
	}); //  end pg.connect
});

//  POST a new user
users.post('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		// TODO: when POSTing is set up on the client, uncomment the line below instead of makeRandomUser()
		// var user = req.body.user;
		var user = faker.makeRandomUser();
		api.get('/users/e/' + user.email, function(err, result, statusCode) {
			if (err) {
				return res.json(500, {error: err});

			//	if statusCode = 404, user doesn't exist
			}	else if (!err && result && statusCode === 404) {
				Users.addUser(client, user, function(err, result) {
					done();

					if (err) {
						res.json(500, {error: err});
					} else {
						res.json(201, {"result": result.rowCount + " user created."});
					}

					client.end();
				});   //  end Users.addUser
			} else if (!err && result && statusCode === 200) {
				res.json(403, {error: "user with email " + result.user.email + " already exists"});
			} else {
				return res.json(statusCode, result);
			}
		});	//	end api.get
	}); //  end pg.connect
});

//	FIXE ME: test this route
//  PUT all users
users.put('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var updates = req.body.updates;
		Users.updateAllUsers(client, updates, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(200, {result: result});			
			}

			client.end();
		});
	});
});


//  DELETE all users
users.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {		
		if (err) {
			return res.json(500, {error: err});
		}

		Users.deleteAllUsers(client, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(204, {result: "deleted " + result.rowCount + " users"});
			}

			client.end();
		});  // end Users.delete
	}); //  end pg.connect
});


/** ==========
*
*	/users/:id
*
*/

//	GET one user
//		@param id: integer, a user's ID number
users.get('/:id', function(req, res) {
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
});

//	TODO: pull email param from req.body instead of req.params
//	GET one user
//		@param email: string, a user's email address
users.get('/e/:email', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var email = req.params.email;
		Users.getUserByEmail(client, email, function(err, result) {
			done();

			if (!err && (result.length > 0) ) {
				res.json(200, {user: result[0]});
			} else if (result.length === 0) {
				res.json(404, {error: 'user ' + email + ' does not exist'});
			} else {
				res.json(500, {error: err});
			}

			client.end();
		});	//	end Users.get by email
	});	//	end pg.connect
})

//	FIX ME: make sure this route works
//	PUT an update to one user
//		@param id: a user's id number
users.put('/:id', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var user_id = req.params.id;
		var updates = req.body.updates;
		Users.updateUserById(client, user_id, updates, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(201, {result: result});
				// res.json(200, {user: '/returns ' + id + ' s updated user document'});
			}

			client.end();
		});
	});
});

//	DELETE one user
//		@param id: a user's ID number
users.delete('/:id', function(req, res) {
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
						res.json(204, {message: "deleted user " + user_id});
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