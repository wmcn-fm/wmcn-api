var utils = {};
var Schedule = require('./Schedule');
var Show = require('./Show');

//  @param show_ids: an array of show_ids
//  checks an array of show_ids against the current schedule;
//  returns an array of show documents whose id's are a subset of
//    show_ids; (i.e., currently on the schedule)
utils.sortCurrent = function(client, show_ids, cb) {
  var current_shows = [];
  Schedule.getSchedule(client, function(err, schedule) {
    if (err) return cb(err);
    for (var show in show_ids) {
      var thisShow = show_ids[show];

      for (var slot in schedule) {
        var thisSlot = schedule[slot];
        if (thisSlot.show !== 'automator') {
          if (thisSlot.show.id === thisShow) {
            current_shows.push(thisSlot.show);
          }
        }
      } //  end schedule loop
    }   //  end sids loop

    if (!current_shows.length > 0) {
      current_shows = null;
    }
    return cb(null, current_shows);
  });
}


module.exports = utils;
