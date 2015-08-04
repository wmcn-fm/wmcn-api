var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');
var marked = require('marked');

var auth = require('./lib/auth');

var users = require('./routes/users');
var shows = require('./routes/shows');
var playlists = require('./routes/playlists');
var schedule = require('./routes/schedule');
var applications = require('./routes/applications');
var hosts = require('./routes/hosts');
var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(auth.checkForToken());
app.use('/users', users);
app.use('/shows', shows);
app.use('/playlists', playlists);
app.use('/schedule', schedule);
app.use('/applications', applications);
app.use('/hosts', hosts);
app.use('/login', login);

app.get('/', function(req, res) {
  var mdFile = fs.readFileSync('./README.md', 'utf8');
  res.send(marked(mdFile));
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
