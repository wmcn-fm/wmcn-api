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
      cb(null, result.rows);
    }
  });
}


Schedule.scheduleShow = function(client, show, cb) {
  var values = [show.timeslot, show.show_id];
  var query = "INSERT INTO schedule(timeslot, show_id) \
                VALUES($1, $2)";
  client.query(query, values, function(err, result) {
    if (err) {
      cb(err);
    } else {
      cb(null, result.rowCount);
    }
  });
}

Schedule.deleteShowAtTime = function(client, timeslot, cb) {
  var qStr = "DELETE FROM schedule WHERE timeslot = $1";
  client.query(qStr, [timeslot], function(err, result) {
    if (err) {
      return cb(err);
    } else {
      cb(null, result);
    }
  });
}


module.exports = Schedule;