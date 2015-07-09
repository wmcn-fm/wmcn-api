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

    switch (type) {
      case 'user':
        return userKeys[userKeys.length * Math.random() << 0];
      case 'show':
        return showKeys[showKeys.length * Math.random() << 0];
    }
};

module.exports = utils;
