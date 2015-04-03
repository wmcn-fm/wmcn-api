var user = process.env.USER;
var pw = process.env.PW;
var db = 'wmcntest';

// if (process.env.NODE_ENV === 'development') {
// 	db = 'wmcntest';
// } else {
// 	db = 'wmcn-production';
// }

var conString = "postgres://" + user + ":" + pw + "@localhost/" + db;

module.exports = conString;