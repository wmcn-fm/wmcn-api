var config = require('../config/config')();
var api = require('../models/api');

var utils = {};

utils.getValid = function(table, cb) {
  var path = '/' + table + '/';
  api.get(path, function(err, result, statusCode) {
    if (!err && result && statusCode == 200) {
      var ids = [];
      var resObj = result[table];
      for(var i in resObj) {
        ids.push(resObj[i].id);
      }
      var random_id = ids[Math.floor(Math.random()*ids.length)];
      cb(null, random_id);
    } else {
      cb(err);
    }
  });
}

utils.randomProperty = function (type) {
    var userKeys = ['first_name', 'last_name', 'phone',
                'email', 'hash', 'grad_year', 'mac_id', 'iclass'];
    var showKeys = ['title', 'blurb'];
    var plKeys = ['show_id', 'content'];
    var appKeys = userKeys.concat(showKeys, ['availability', 'time_pref', 'description']);
    var hashIndex = appKeys.indexOf('hash');
    if (hashIndex > -1) {
      appKeys.splice(hashIndex, 1);
    }

    switch (type) {
      case 'user':
        return userKeys[userKeys.length * Math.random() << 0];
      case 'show':
        return showKeys[showKeys.length * Math.random() << 0];
      case 'playlist':
        return plKeys[plKeys.length * Math.random() << 0];
      case 'app':
        return appKeys[appKeys.length * Math.random() << 0];
    }
};

module.exports = utils;
