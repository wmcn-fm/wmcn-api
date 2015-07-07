var s = require('./settings.json');

var node_env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3001;    // or 81
var db = process.env.DB || 'test';      // or production
var user = process.env.USER;
var pw = process.env.PW;

function configure() {
  var env = {};
  env.node_env = node_env;
  env.port = port;
  env.dbMode = db;
  env.db = makeDbUrl(db);
  env.api_root_url = 'http://localhost:' + port;
  return env;
}


function makeDbUrl(db) {
  var db_stem = s.db.stem;
  if (db === 'test') {
    return db_stem + user + ":" + pw + "@" + s.db.host.dev + '/' + s.db.name.dev;
  } else {
    return db_stem + user + ":" + pw + "@" + s.db.host.production + '/' + s.db.name.production;
  }
}

module.exports = function(){
  return configure();
};
