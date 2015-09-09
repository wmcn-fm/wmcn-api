var s = require('./settings.json');
var credentials = require('../lib/db-credentials');

var node_env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3001;    // or 81
var db = process.env.DB || 'test';      // or production or local
var user = process.env.USER;
var pw = process.env.PW;

function configure() {
  var env = {};
  env.node_env = node_env;
  env.port = port;
  env.dbMode = db;
  env.db = credentials[db];
  env.api_root_url = 'http://localhost:' + port;
  return env;
}

module.exports = function(){
  return configure();
};
