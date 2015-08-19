var superagent = require('superagent');
var forEachAsync = require('forEachAsync').forEachAsync;

var fake = require('./fake');
var config = require('../config/config')();
var root = config.api_root_url;

var token;
var apps = [];
superagent.get(root + '/authenticate/dev')
.query({id: 4, access: 4})
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
      var id = res.body.new_app.id;

      superagent.post(root + '/applications/' + id + '/approve')
      .set('x-access-token', token)
      .send({timeslot: fake.getRandomInt(0, 167) })
      .end(function(e, res) {
        if (e) return console.log(e);
        console.log(res.body);
        if (res.body.result && res.body.result.show) {
          var show = res.body.result.show;
          var playlists = [];
          for (var i=0; i<6; i++) {
            var pl = fake.makeRandomPlaylist();
            pl.show_id = show.id;
            playlists.push(pl);
          }

          forEachAsync(playlists, function(next2, pl, j, arr) {
            superagent.post(root + '/shows/' + show.id + '/playlists')
            .set('x-access-token', token)
            .send({playlist: pl})
            .end(function(e, res) {
              if (e)return console.log(e);
              next2();
            })
          }).then(function() {
            next();
          });
        } else {
          next();
        }
      });
    }); //  end post app
  }).then(function() {
    console.log('done!');
  });
});
