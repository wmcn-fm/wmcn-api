var express = require('express');
var authenticate = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Users = require('../models/User');
var auth = require('../lib/auth');

authenticate.route('/')
  //  log in
  .post(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        done();
        return res.json(500, {loggedIn: false, error: err});
      }

      var user_id = req.body.user_id;
      var hash = req.body.hash;
      if (!user_id || !hash) {
        done();
        return res.json(400, {error: 'Request body is missing required information', loggedIn: false});
      }

      Users.getUserById(client, user_id, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err, loggedIn: false});
        } else if (!err && result.length < 1) {
          res.json(400, {error: 'User ' + user_id + ' not found', loggedIn: false});
        } else {
          var user = result[0];

          if (hash !== user.hash) {
            res.json(401, {error: 'Incorrect password', loggedIn: false});
          } else {
            var token = auth.createToken({id: user.id, access: user.access});
            res.set('x-access-token', token).json(201, {loggedIn: true, token: token });
          }
        }
      }); //  end getUserById


    }); //  end pg.connect
  });

authenticate.route('/verify')
  .get(function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.json(401, {error: 'missing token'});
    auth.verifyToken(token, function(err, decoded) {
      if (err) return res.json(500, {error: err});
      res.json(200, {decoded: decoded});
    });
  });

authenticate.route('/dev')
  .get(function(req, res) {
    if (process.env.NODE_ENV == 'production') {
      res.json(500, {error: 'unavailable in production mode'});
    } else {
      var token = auth.createToken({id: req.query.id, access: req.query.access});
      res.json(200, {token: token});
    }
  });


module.exports = authenticate;
