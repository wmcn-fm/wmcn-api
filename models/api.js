var superagent = require('superagent');
var config = require('../config/config')();
var root = config.api_root_url;

var api = {};

api.get = function(path, cb) {
	var url = root + path;
	superagent.get(url).end(function(err, result) {
		if (err) {
			cb(err);
		} else {
			cb(null, JSON.parse(result.text), result.statusCode);
		}
	});
}

api.post = function(path, params, cb) {
	var url = root + path;
	superagent.post(url).send(params).end(function(err, result) {
		if (err) {
			cb(err);
		} else {
			cb(null, JSON.parse(result.text), result.statusCode);
		}
	});
}


module.exports = api;
