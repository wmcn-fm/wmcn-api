var utils = {};


//  takes in a JSON object and its type, passing
//    the object and its corresponding keys off to checkColumns
//  @param obj: a JSON object that should contain required fields
//              for user or show tables
//  @param type: string, the table the object belongs to
utils.hasMissingColumns = function(obj, type) {
  var userKeys = ['first_name', 'last_name', 'phone',
              'email', 'hash', 'grad_year', 'mac_id', 'iclass'];
  var showKeys = ['title', 'blurb'];
  var scheduleKeys = ['timeslot', 'show_id'];
  switch(type) {
    case 'user':
      return checkColumns(obj, userKeys);
    case 'show':
      return checkColumns(obj, showKeys);
    case 'schedule':
      return checkColumns(obj, scheduleKeys);
  }
}


//  iterates over the object and the set of keys it should contain
//    values for;
//  returns false if the object has a value for each key,
//  otherwise returns the missing key
function checkColumns(obj, keys) {
  for (var key in keys) {
    if (!obj[keys[key]]) {
      return keys[key];
    }
  }
  return false;
}

module.exports = utils;
