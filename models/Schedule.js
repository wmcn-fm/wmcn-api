var Show = require('./Show');
var Schedule = {};

Schedule.getSchedule = function(client, cb) {
  var query = client.query("SELECT * FROM schedule");
  query.on('error', function(err) {
    cb(err);
    })
    .on('row', function(row, result) {
    result.addRow(row);
    })
    .on('end', function(result) {
      cb(null, result.rows);
  });
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
