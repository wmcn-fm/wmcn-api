var jwt = require('jsonwebtoken');
var cert = process.env.PRIVATE_KEY;
var exp = 10080; // 7 days


var auth = {};

auth.cert = cert;

//  returns a signed jwt
auth.createToken = function(payload) {
  return jwt.sign(payload, cert, {
    expiresInMinutes: exp
  });
}

//  decodes the token and verifies that it hasn't expired;
//  returns decoded payload or error
auth.verifyToken = function(token, cb) {
  jwt.verify(token, auth.cert, function(err, decoded) {
    if (err) return cb(err);
    var now = new Date().getTime() / 1000;
    if (now > decoded.exp) cb(new Error('Token expired') );
    cb(null, decoded);
  });
}

//  checks req body, query, and headers for x-access-token and
//  assigns req.headers['x-access-token'] to the given value or null;
//  bootstrapped to every route
auth.checkForToken = function() {
  return function (req, res, next) {
    console.log('hello from checkForToken middleware');
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      req.headers['x-access-token'] = token;
      res.set('x-access-token', token);
      next();
    } else {
      req.headers['x-access-token'] = null;
      next();
    }
  }
}

//  authentication middleware to determine if the client has sufficient
//  access to view the requested resource.
//  if the token exists, is verified by auth.verifyToken, and has
//   equal or greater access, forwards to next middlware.
//  otherwise returns 40X error
//  @param level: int, access level required (0-4)
auth.requiresAccess = function(level) {
  return function (req, res, next) {

    if (!level > 0) {
      next();
    } else {
      var token = req.headers['x-access-token'];
      if (!token) {
        return res.json(403, {error: 'Access token required.', loggedIn: false});
      }

      auth.verifyToken(token, function(err, decoded) {
        if (err) {
          return res.json(401, {error: err});
        } else {
          if (decoded.access >= level) {
            next();
          } else {
            return res.json(403, {error: 'Request requires access level ' + level});
          }
        }
      });
    }
  }
}


module.exports = auth;
