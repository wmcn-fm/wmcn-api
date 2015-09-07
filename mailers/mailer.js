var mailer = require('nodemailer');
var jade = require('jade');
var fs = require('fs');
var credentials = {user: 'wmcn@macalester.edu', pass: process.env.EMAIL_PW};
var transporter = mailer.createTransport({service: 'Gmail', auth: credentials});
var default_options = {
  from: 'WMCN.fm noreply <noreply@wmcn.fm>',
  to: 'willkentdaggett@gmail.com',
  subject: 'WMCN.fm Login Information',
  html: '<p>test!</p>'
}

var template;

fs.readFile('./mailers/welcome_template.jade', 'utf-8', function(err, source) {
  if (err) {
    return console.log(err);
  } else {
    template = jade.compile(source);
  }
});


module.exports = function(user, pw, cb) {
  var opts = default_options;
  user['password'] = pw;

  //  avoid generating massive amounts of spam
  if (process.env.NODE_ENV === 'production') opts.to = user.email;

  var html = template(user);

  opts.html = html;
  console.log(opts);

  transporter.sendMail(opts, function(err, info) {
    if (err) return cb(err);
    cb(null, info);
  });
}
