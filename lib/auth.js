var jwt = require('jsonwebtoken');
var cert = process.env.PRIVATE_KEY;
var exp = 10080; // 7 days


var auth = {};

auth.cert = cert;

auth.createToken = function(payload) {
  return jwt.sign(payload, cert, {
    expiresInMinutes: exp
  });
}

auth.verifyToken = function(token, cb) {
  jwt.verify(token, auth.cert, function(err, decoded) {
    if (err) return cb(err);
    cb(null, decoded);
  });
}

//  default middleware to set x-access-token to the given token or null
//  called by every route
auth.checkForToken = function() {
  return function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      req.headers['x-access-token'] = token;
      next();
    } else {
      req.headers['x-access-token'] = null;
      next();
    }
  }
}


module.exports = auth;
