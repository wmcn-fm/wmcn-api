var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('show route', function() {

  before(function(done) {
    superagent.del(root + '/hosts')
    .end(function(e, res) {
      if (e) return console.log(e);
    });
    superagent.del(root + '/schedule')
    .end(function(e, res) {
      if (e) return console.log(e);
    });
    superagent.del(root + '/playlists')
    .end(function(e, res) {
      if (e) return console.log(e);
    });
    superagent.del(root + '/shows')
    .end(function(e, res) {
      if (e) return console.log(e);
      done();
    });
  }); //  end before

  it('should initially get an empty table', function (done) {
    superagent.get(root + '/shows')
    .end(function (e,res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('No shows found.');
      expect(res.body.shows).to.be.empty();
      done();
    });
  }); //  end empty table

  describe('creating a new show', function() {
    var fakeShow;
    var newShow;
    before(function(done) {
      fakeShow = fake.makeRandomShow();
      done();
    });

    it('should add a new show', function (done) {
      superagent.post(root + '/shows')
      .send({show: fakeShow})
      .end(function (e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(201);
        expect(res.body.result).to.eql('1 show created.');
        newShow = res.body.new_show;
        done();
      });
    }); //  end add a new show

    it('should retrieve the new show', function (done) {
      superagent.get(root + '/shows/' + newShow.id)
      .end(function (e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(res.body.show.id).to.eql(newShow.id);
        expect(res.body.show.title).to.eql(newShow.title);
        done();
      });
    }); //  end retrieve new show

    it('should remove the new show', function(done) {
      superagent.del(root + '/shows/' + newShow.id)
      .end(function(e, res){
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(res.body.message).to.eql('deleted show ' + newShow.id);

        superagent.get(root + '/shows/' + newShow.id)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.eql(404);
          done();
        });
      });
    }); //  end remove new show

    describe('error handler', function() {
      var badShow;
      before(function(done) {
        badShow = fake.makeRandomShow();
        done();
      });
      it('should catch undefined show', function(done) {
        var badShow;
        superagent.post(root + '/shows')
        .send({show: badShow})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.eql('show object is ' + badShow);
          expect(res.statusCode).to.equal(400);
          done();
        });
      }); //  end undefined

      it('should catch any missing column', function(done) {
        var randomProp = utils.randomProperty('show');
        badShow[randomProp] = null;
        superagent.post(root + '/shows')
        .send({show: badShow})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.eql(randomProp + ' field is missing');
          done();
        });
      });  // end catch missing col

      it('should catch duplicate shows', function(done) {
        var newShow = fake.makeRandomShow();
        var origTitle = newShow.title;

        superagent.post(root + '/shows')
        .send({show: newShow})
        .end(function (e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(201);
          expect(res.body.new_show.title).to.eql(origTitle);

          superagent.post(root + '/shows')
          .send({show: {title: origTitle, blurb: 'blah'} })
          .end(function(e, res) {
            expect(e).to.eql(null);
            expect(res.statusCode).to.equal(500);
            expect(res.body).to.only.have.key('error');
            expect(res.body.error).to.eql('Key (title)=(' + origTitle + ') already exists.');
            done();
          });
        });
      }); //  end catch duplicate
    }); //  end error handler show
  }); //  end creating a new show

  describe('hosts', function() {
    var show;
    var user1;
    var user2;

    before(function(done) {
      superagent.post(root + '/shows')
      .send({show: fake.makeRandomShow()})
      .end(function(e, res) {
        if (e) return console.log(e);
        show = res.body.new_show;

        superagent.post(root + '/users')
        .send({user: fake.makeRandomUser()})
        .end(function(e, res) {
          if (e) return console.log(e);
          user1 = res.body.new_user;

          superagent.post(root + '/users')
          .send({user: fake.makeRandomUser()})
          .end(function(e, res) {
            if (e) return console.log(e);
            user2 = res.body.new_user;
            done();
          });
        });
      });
    }); //  end before

    it("should initialize empty", function(done){
      superagent.get(root + '/shows/' + show.id + '/hosts')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal('show ' + show.id + ' has no listed hosts');
        done();
      });
    }); //  end init empty

    it("should add a user as a host", function(done) {
      superagent.post(root + '/shows/' + show.id + '/hosts')
      .send({host_id: user1.id})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.key('result');
        expect(res.body.result).to.equal('Added user ' + user1.id + " to show " + show.id);

        superagent.post(root + '/shows/' + show.id + '/hosts')
        .send({host_id: user2.id})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.only.have.key('result');
          expect(res.body.result).to.equal('Added user ' + user2.id + " to show " + show.id);
          done();
        });
      });
    }); //  end add user as host

    it('should retrieve the hosts', function(done) {
      superagent.get(root + '/shows/' + show.id + '/hosts')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('hosts');
        expect(res.body.hosts).to.have.length(2);
        expect(res.body.hosts[0]).to.eql(user1);
        expect(res.body.hosts[1]).to.eql(user2);
        done();
      });
    });
  }); //  end describe pairing hosts

  describe('playlists', function() {
    var show;
    var pl1;
    var pl2;

    before(function(done) {
      pl1 = fake.makeRandomPlaylist();
      pl2 = fake.makeRandomPlaylist();

      superagent.del(root + '/playlists')
      .end(function(e, res) {
        if (e) return console.log(e);

        superagent.post(root + '/shows')
        .send({show: fake.makeRandomShow()})
        .end(function(e, res) {
          if (e) return console.log(e);
          show = res.body.new_show;
          pl1.show_id = show.id;
          pl2.show_id = show.id;
          done();
        });
      });
    }); //  end before

    it("should initialize empty", function(done){
      superagent.get(root + '/shows/' + show.id + '/playlists')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal('No playlists found for show ' + show.id);
        done();
      });
    }); //  end init empty

    it("should add a playlist", function(done) {
      superagent.post(root + '/shows/' + show.id + '/playlists')
      .send({playlist: pl1})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.keys('result', 'new_playlist');
        expect(res.body.result).to.equal('1 playlist created');
        expect(res.body.new_playlist.content).to.equal(pl1.content);
        pl1 = res.body.new_playlist;

        superagent.post(root + '/shows/' + show.id + '/playlists')
        .send({playlist: pl2})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.only.have.keys('result', 'new_playlist');
          expect(res.body.result).to.equal('1 playlist created');
          expect(res.body.new_playlist.content).to.equal(pl2.content);
          pl2 = res.body.new_playlist;
          done();
        });
      });
    }); //  end add playlists

    it('should retrieve the playlists', function(done) {
      superagent.get(root + '/shows/' + show.id + '/playlists')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('playlists');
        expect(res.body.playlists).to.have.length(2);
        expect(res.body.playlists[0]).to.eql(pl2);
        expect(res.body.playlists[1]).to.eql(pl1);
        done();
      });
    }); //  end retrieve playlists

    it('should retrieve one playlist', function(done) {
      superagent.get(root + '/shows/' + show.id + '/playlists?limit=1')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('playlists');
        expect(res.body.playlists).to.have.length(1);
        expect(res.body.playlists[0]).to.eql(pl2);
        done();
      });
    }); //  end retrieve playlists
  }); //  end describe playlists
}); //  end show route
