var express = require('express');
var hosts = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Show = require('../models/Show');
var api = require('../models/api');
var auth = require('../lib/auth');


hosts.route('/')
  .get(function(req, res) {
    pg.connect(db, function (err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      Show.getAllHosts(client, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err});
        } else {
          res.json(200, {hosts: result});
        }

        client.end();
      }); //  end Show.
    }); //  end pg.connect
  }) //  end .get

  .delete(auth.requiresAccess(4), function(req, res) {
    pg.connect(db, function (err, client, done) {
      if (err) {
        done();
        return res.json(500, {error: err});
      }

      Show.deleteAllHosts(client, function(err, result) {
        done();

        if (!err && result) {
          res.json(200, {result: "deleted " + result.rowCount + " hosts"});
        } else {
          res.json(500, {error: err});
        }
      }); //  end deleteHosts
    }); //  end pg.connect
  }); //  end .delete

module.exports = hosts;
