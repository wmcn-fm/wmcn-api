var s = require('./settings.json');

var dev = {};
var production = {};
var env = process.env.NODE_ENV;
var user = process.env.USER;
var pw = process.env.PW;

function configure(node_env) {
  var env = {};
  var api_root_url;
  var db;

  var api_version = s.api.v;
  var db_stem = s.db.stem;

  if (node_env !== 'production') {
    api_root_url = s.api.stem + s.api.url.dev + ":" + s.api.port.dev;
    db = db_stem + user + ":" + pw + "@" + s.db.host.dev + '/' + s.db.name.dev;
  } else {
    api_root_url = s.api.stem + s.api.url.dev + ":" + s.api.port.dev;
    db = db_stem + user + ":" + pw + "@" + s.db.host.dev + '/' + s.db.name.dev;
    // api_root_url = s.api.stem + s.api.url.production + '/v' + api_version + '/';
    // db = db_stem + user + ":" + pw + "@" + s.db.host.production + '/' + s.db.name.production;
  }

  env.api_root_url = api_root_url;
  env.db = db;
  return env;
}

module.exports = function(){
  switch(env){
    case 'development':
      return configure('development');

    case 'production':
      return configure('production');

    default:
      return configure('development');
  }
};

