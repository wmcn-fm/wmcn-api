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
      var id = res.body.new_app.id;
      var timeslot;
      if ( i % 2 == 0) {
        timeslot = fake.getRandomInt(0, 167);
      } else {
        timeslot = [];
        for (var count=0; count<fake.getRandomInt(2, 15); count++) {
          timeslot.push(fake.getRandomInt(0, 167));
        }
      }

      superagent.post(root + '/applications/' + id + '/approve')
      .set('x-access-token', token)
      .send({timeslot: timeslot })
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

          if (res.body.result.users && res.body.result.users.length > 2) {
            superagent.post(root + '/staff')
            .set('x-access-token', token)
            .send({id: res.body.result.users[2].id, level: fake.getRandomInt(2, 4)})
            .end(function(e, res) {
              if (e) return console.log(e);
              console.log(res.body);
            });
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
