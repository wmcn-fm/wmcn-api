var superagent = require('superagent');
var config = require('../config/config')();
var root_url = config.api_root_url;

var api = {};

api.get = function(url, cb) {
	var fullUrl = root_url + url;
	superagent.get(fullUrl).end(function(err, result) {
		if (err) {
			cb(err);
		} else {
			cb(null, JSON.parse(result.text), result.statusCode);
		}
	});
}

api.post = function(url, params, cb) {
	var fullUrl = root_url + url;
	superagent.post(fullUrl).send(params).end(function(err, result) {
		if (err) {
			cb(err);
		} else {
			cb(null, JSON.parse(result.text), result.statusCode);
		}
	});
}


module.exports = api;
