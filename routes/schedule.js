var express = require('express');
var schedule = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Schedule = require('../models/Schedule');
var api = require('../models/api');
var utils = require('./utils/route-utils');
var auth = require('../lib/auth');

schedule.route('/')
  .get(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        done();
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
  .post(auth.requiresAccess(3), function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        done();
        return res.json(500, {error: err});
      }

      var show = req.body.show;
      Schedule.scheduleShow(client, show, function(err, result) {
        done();

        if (err) {
          console.log(err);
          var error;
          if (err === 'selected timeslots are all full; show is unscheduled') {
            res.status(409);
            error = err;
          } else {
            res.status(500);
            error = err.detail;
          }
          res.json({error: error});
        } else {
          var resObj = {show: show.show_id, scheduled_at: [], failed: []};
          for (var i in result) {
            var thisSlot = result[i];

            if (thisSlot.hasOwnProperty('timeslot') && thisSlot.hasOwnProperty('show_id') && thisSlot.show_id === show.show_id) {
              resObj.scheduled_at.push(thisSlot.timeslot);
            } else {
              if (thisSlot.hasOwnProperty('error')) {
                resObj.failed.push(thisSlot.error);
              }
            }
          }

          if (!resObj.scheduled_at.length > 0) {
            delete resObj.scheduled_at;
            return res.json(403, {error: resObj})
          }

          if (!resObj.failed.length > 0) delete resObj.failed;
          res.json(201, resObj);
        }
      }); //  end Schedule.scheduleShow
    }); //  end pg.connect
  })
  .delete(auth.requiresAccess(4), function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        done();
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
      }); //  end
    }); //  end pg.connect
  });

schedule.route('/now')
  .get(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        done();
        return res.json(500, {error: err});
      }

      var time = utils.getCst();
      var ts = utils.getTimeslot(time);
      Schedule.getShowAtTime(client, ts, function(err, result) {
        done();

        if (!err && result) {
          res.json(200, {timeslot: ts, show: result});
        } else if (!err) {
          res.json(404, {error: 'no show exists at hour ' + ts, timeslot: ts, show: 'automator'});
        } else {
          res.json(500, {error: err.detail});
        }
      }); //  end getShowAtTime
    })  //  end pg.connect
  });

schedule.route('/next')
  .get(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        done();
        return res.json(500, {error: err});
      }

      var time = utils.getCst();
      var ts = utils.getTimeslot(time);
      var next = parseInt(req.query.next) || 1;

      Schedule.getUpcoming(client, ts, next, function(err, result) {
        done();

        if (!err && result) {
          res.json(200, {shows: result});
        } else if (!err) {
          res.json(404, {error: 'No upcoming shows', shows: 'automator'});
        } else {
          res.json(500, {error: err.detail});
        }
      }); //  end getUpcoming
    })  //  end pg.connect
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
        done();
        return res.json(400, {error: 'timeslot ' + timeslot + ' is out of range 0-167'});
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
      }); //  end Schedule.getShowAtTime
    }); //  end pg.connect
  })  //  end .get
  .delete(auth.requiresAccess(4), function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      var timeslot = req.params.timeslot;
      //  catch invalid params
      if ( !(0 <= timeslot && timeslot <= 167)) {
        done();
        return res.json(400, {error: 'timeslot ' + timeslot + ' is out of range 0-167'});
      }

      Schedule.deleteShowAtTime(client, timeslot, function(err, result) {
        done();

        if (!err && result) {
          res.json(200, {result: "cleared slot " + timeslot});
        } else if (!err) {
          res.json(404, {error: "timeslot " + timeslot + " is empty"});
        } else {
          res.json(500, {error: err});
        }

      }); //  end Schedule.delete
    }); //  end pg.connect
  });

module.exports = schedule;
