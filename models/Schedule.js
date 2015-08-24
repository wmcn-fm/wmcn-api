var forEachAsync = require('forEachAsync').forEachAsync;
var Show = require('./Show');
var Schedule = {};

Schedule.getSchedule = function(client, cb) {

  var schedule = new Array(168);
  forEachAsync(schedule, function(next, e, i, arr) {
    Schedule.getShowAtTime(client, i, function(err, show) {
      if (err) return cb(err);

      schedule[i] = {timeslot: i};
      if (show !== null) {
        schedule[i]['show'] = show;
      } else {
        schedule[i]['show'] = 'automator';
      }

      next();
    });
  }).then(function() {
    cb(null, schedule);
  })
}

Schedule.deleteSchedule = function(client, cb) {
  var query = client.query("DELETE FROM schedule");
  query.on('error', function(err) {
    cb(err);
    })
    .on('row', function(row, result) {
    result.addRow(row);
    })
    .on('end', function(result) {
      cb(null, result.rowCount);
  });
}


Schedule.getShowAtTime = function(client, timeslot, cb) {
  var values = [timeslot];
  var query = "SELECT * FROM schedule WHERE timeslot = $1";
  client.query(query, values, function(err, result) {
    if (err) {
      cb(err);
    } else {

      if (result.rows[0]) {
        Show.getShowById(client, result.rows[0].show_id, function(err, show) {
          if (err) return cb(err);
          cb(null, show[0]);
        });
      } else {
        cb(null, null);
      }

    }
  });
}

Schedule.getUpcoming = function(client, current_timeslot, numShows, cb) {
  Schedule.getSchedule(client, function(err, sched) {
    if (err) return cb(err);

    var shows = [];
    for (var i=current_timeslot + 1; i<sched.length; i++) {
      if (shows.length === numShows) {
        return cb(null, shows);
      }

      if (sched[i].show !== 'automator') {
        shows.push(sched[i]);
      }
    }
  })
}


Schedule.scheduleShow = function(client, show, cb) {
  var values = [show.timeslot, show.show_id];
  var query = "INSERT INTO schedule(timeslot, show_id) \
                VALUES($1, $2 ) RETURNING *";
  client.query(query, values, function(err, result) {
    if (err) {
      cb(err);
    } else {
      cb(null, result.rows);
    }
  });
}

Schedule.deleteShowAtTime = function(client, timeslot, cb) {
  var qStr = "DELETE FROM schedule WHERE timeslot = $1";
  client.query(qStr, [timeslot], function(err, result) {
    if (err) {
      return cb(err);
    } else {
      cb(null, result.rowCount);
    }
  });
}


module.exports = Schedule;
