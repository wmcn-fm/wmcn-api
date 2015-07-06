var express = require('express');
var schedule = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Schedule = require('../models/Schedule');
var api = require('../models/api');

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

        if (err) {
          res.json(500, {error: err});
        } else {
          res.json(200, {schedule: result});
        }

        client.end();
      }); //  end
    }); //  end pg.connect
  })
  .post(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      var show;
      if (process.env.NODE_ENV === 'production') {
        show = req.body.show;
      } else {
        show = faker.makeRandomScheduleRow();
        show.show_id = req.body.show_id;
      }


      Schedule.scheduleShow(client, show, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err});
        } else {
          res.json(201, {result: result + " show added to the schedule."});
        }

        client.end();
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
        return res.json(500, {error: err});
      }
      var timeslot = req.params.timeslot;
      Schedule.getShowAtTime(client, timeslot, function(err, result) {
        done();

        if (!err && (result.length > 0) ) {

          api.get('/shows/' + result[0].show_id, function(err, result, statusCode) {
            if (err) {
              res.json(500, {error: err});
            } else if (!err && result && statusCode === 200) {
              res.json(200, {show: result.show});
            } else {
              res.json(statusCode, result);
            }
          }); //  end api.get

        } else if (result.length === 0) {  
          res.json(404, {error: 'no show exists at hour ' + timeslot});
        } else {
          res.json(500, {error: err});
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