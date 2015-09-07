var superagent = require('superagent');
var forEachAsync = require('forEachAsync').forEachAsync;

var fake = require('./test/fake');
var config = require('./config/config')();
var root = config.api_root_url;

var token;
var apps = [];
superagent.get(root + '/authenticate/dev')
.query({id: 4, access: 5})
.end(function(e, res) {
  if (e) return console.log(e);
  token = res.body.token;
  console.log(token);


  for (var i=0; i<168; i++) {
    apps.push(fake.makeRandomApp() );
  }



  forEachAsync(apps, function(next, app, i, arr) {
    superagent.post(root + '/applications')
    .send({app: app})
    .end(function(e, res) {
      if (e) return console.log(e);
      console.log(res.body);
      next();
    }); //  end post app
  }).then(function() {
    superagent.post(root + '/users')
    .set('x-access-token', token)
    .send({user: fake.makeRandomUser() })
    .end(function(e, res) {
      if (e) return console.log(e);
      console.log(res.body.new_user);
      superagent.post(root + '/staff?level=4')
      .set('x-access-token', token)
      .send({id: res.body.new_user.id})
      .end(function(e, res) {
        if (e) return console.log(e);
        console.log(res.body.result);
        return console.log('done!');
      })
    });
  });
});
