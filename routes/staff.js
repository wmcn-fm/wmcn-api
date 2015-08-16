var express = require('express');
var staff = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Users = require('../models/User');
var auth = require('../lib/auth');


staff.route('/')
	.get(function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var loggedIn = req.headers['x-access-token'];
			var restrictPrivate = !loggedIn;
			var level = req.query.level;

			console.log(loggedIn, restrictPrivate, level);
			Users.getStaff(client, level, restrictPrivate, function(err, result) {
				done();

				if (!err && result) {
					res.json(200, {staff: result});
				} else if (!err) {
					var errMsg = 'No staff found';
					if (level) {errMsg += ' with access level ' + level}
					res.json(404, {error: errMsg, staff: []});
				} else {
					res.json(500, {error: err});
				}
			});
		});	//	pg.connect
	})
	.post(auth.requiresAccess(4), function(req, res) {
		pg.connect(db, function(err, client, done) {
			if (err) {
				done();
				return res.json(500, {error: err});
			}

			var level = req.query.level || req.body.level;
			var user_id = req.body.id;

			console.log(level, user_id);
			Users.editStaff(client, user_id, level, function(err, result) {
				done();

				if (!err && result) {
					res.json(200, {result: 'Updated user ' + user_id + ' to access level ' + level, staff: result});
				} else if (!err) {
					var errMsg = 'No staff found';
					if (level) {errMsg += ' with access level ' + level}
					res.json(404, {error: errMsg, staff: []});
				} else {
					res.json(500, {error: err});
				}
			});
		});	//	pg.connect
	})


module.exports = staff;
