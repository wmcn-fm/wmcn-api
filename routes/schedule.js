var express = require('express');
var schedule = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Schedule = require('../models/Schedule');
var api = require('../models/api');
var utils = require('./route-utils');

//  for testing/development only:
var faker = require('../test/fake');
var utils = require('../test/utils');

schedule.route('/')
  .get(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      Schedule.getSchedule(client, function(err, result) {
        done();

        if (!err && result.length > 0) {
          res.json(200, {schedule: result});
        } else if (!err) {
          res.json(404, {error: 'No scheduled shows'});
        } else {
          res.json(500, {error: err.detail});
        }
      }); //  end getSchedule
    }); //  end pg.connect
  })
  .post(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      var show = req.body.show;
      Schedule.scheduleShow(client, show, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err.detail});
        } else {
          res.json(201, {result: 'Added show ' + result[0].show_id + ' at timeslot ' + result[0].timeslot});
        }
      }); //  end Schedule.scheduleShow
    }); //  end pg.connect
  })
  .delete(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      Schedule.deleteSchedule(client, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err});
        } else if (result > 0) {
          res.json(200, {result: result + " schedule rows deleted"});
        } else {
          res.json(404, {error: "schedule is empty; no rows to delete"});
        }

        client.end();
      }); //  end
    }); //  end pg.connect
  });

schedule.route('/:timeslot')
  .get(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        done();
        return res.json(500, {error: err});
      }
      var timeslot = req.params.timeslot;

      //  catch invalid params
      if ( !(0 <= timeslot && timeslot <= 167)) {
        console.log('hello from invalid timeslot params!!' + timeslot);
        done();
        return res.json(403, {error: 'timeslot ' + timeslot + ' is out of range 0-167'});
      }

      Schedule.getShowAtTime(client, timeslot, function(err, result) {
        done();

        if (!err && result) {
          res.json(200, {show: result});
        } else if (!err) {
          res.json(404, {error: 'no show exists at hour ' + timeslot, show: 'automator'});
        } else {
          res.json(500, {error: err.detail});
        }

        client.end();
      }); //  end Schedule.getShowAtTime
    }); //  end pg.connect
  })  //  end .get
  .delete(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      var timeslot = req.params.timeslot;
      api.get('/schedule/' + timeslot, function(err, result, statusCode) {
        if (err) {
          res.json(500, {error: err});
        } else if (!err && result && statusCode === 200) {
          Schedule.deleteShowAtTime(client, timeslot, function(err, result) {
            done();

            if (err) {
              res.json(500, {error: err});
            } else {
              res.json(200, {result: "cleared slot " + timeslot});
            }

            client.end();
          }); //  end Schedule.delete
        } else {
          res.json(statusCode, result)
        }
      }); //  end api.get
    }); //  end pg.connect
  });

module.exports = schedule;
