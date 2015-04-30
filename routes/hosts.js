var express = require('express');
var hosts = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Show = require('../models/Show');
var api = require('../models/api');

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

  .post(function(req, res) {
    pg.connect(db, function (err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      var show_id = req.body.show_id;
      var host_id = req.body.user_id;
      Show.addHost(client, show_id, host_id, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err.detail});
        } else {
          res.json(201, {result: "Added user " + host_id + " to show " + show_id});
        }

        client.end();
      }); //  end Show.
    }); //  end pg.connect
  })  //  end .post

  .delete(function(req, res) {
    pg.connect(db, function (err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      var show_id = req.body.show_id;
      var host_id = req.body.user_id;
      Show.removeHost(client, show_id, host_id,  function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err});
        } else {
          res.json(200, {result: "removed user " + host_id + " from show " + show_id});
        }

        client.end();
      }); //  end Show.
    }); //  end pg.connect
  }); //  end .delete

module.exports = hosts;