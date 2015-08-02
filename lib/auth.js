var jwt = require('jsonwebtoken');
var cert = process.env.PRIVATE_KEY;
var exp = 10080; // 7 days


var auth = {};

auth.cert = cert;

auth.createToken = function(user) {
  return jwt.sign(user, cert, {
    expiresInMinutes: exp
  });
}

auth.verifyToken = function(token, cb) {
  jwt.verify(token, cert, function(err, decoded) {
    if (err) return cb(err);
    cb(null, decoded);
  });
}


module.exports = auth;
