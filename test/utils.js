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



module.exports = utils;