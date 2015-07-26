var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('playlists', function() {
  var show;
  var playlist;
  before(function(done) {
    superagent.del(root + '/playlists')
    .end(function(e, res) {
      if (e) return console.log(e);

      superagent.post(root + '/shows')
      .send({show: fake.makeRandomShow() })
      .end(function(e, res) {
        if (e) return console.log(e);
        show = res.body.new_show;
        playlist = fake.makeRandomPlaylist();
        playlist.show_id = show.id;
        done();
      });
    });
  }); //  end before

  it('should initialize empty', function(done) {
    superagent.get(root + '/playlists')
    .end(function(e, res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.only.have.keys('error', 'playlists');
      expect(res.body.playlists).to.be.empty();
      expect(res.body.error).to.equal('No playlists found');
      done();
    })
  }); //  end initialize empty

  describe('creating a playlist', function() {
    it('should create a playlist', function(done) {
      superagent.post(root + '/playlists')
      .send({playlist: playlist})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.keys('result', 'new_playlist');
        expect(res.body.result).to.equal('1 playlist created');
        expect(res.body.new_playlist.content).to.equal(playlist.content);
        done();
      });
    }); //  end creat playlist

    it('should catch undefined playlist', function(done) {
      var badPl;
      superagent.post(root + '/playlists')
      .send({playlist: badPl})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.eql('playlist object is ' + badPl);
        expect(res.statusCode).to.equal(403);
        done();
      });
    }); //  end undefined pl

    it('should catch any missing column', function(done) {
      var badPl = fake.makeRandomPlaylist();
      var randomProp = utils.randomProperty('playlist');
      badPl[randomProp] = null;
      superagent.post(root + '/playlists')
      .send({playlist: badPl})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(403);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.eql('Playlist is missing information');
        done();
      });
    });  // end catch missing col
  }); //  end describe creating playlist


  describe('single playlist', function() {
    var playlist;
    before(function(done) {
      playlist = fake.makeRandomPlaylist();
      playlist.show_id = show.id;

      superagent.post(root + '/playlists')
      .send({playlist: playlist})
      .end(function(e, res) {
        if (e) return console.log(e);
        playlist = res.body.new_playlist;
        done();
      });
    }); //  end before

    it('should retrieve one playlist', function(done) {
      superagent.get(root + '/playlists/' + playlist.id )
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('playlist');
        expect(res.body.playlist).to.eql(playlist);
        done();
      });
    }); //  end retrieve one playlist

    it('should delete the playlist', function(done) {
      superagent.del(root + '/playlists/' + playlist.id)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('result');
        expect(res.body.result).to.equal('Deleted playlist ' + playlist.id);

        superagent.get(root + '/playlists/' + playlist.id)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(404);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.equal("Couldn't find playlist " + playlist.id);
          done();
        });
      });
    }); //  end delete playlist
  }); //  end describe single playlist

  describe('query limiter', function() {
    var playlist1;
    var playlist2;
    before(function(done) {
      playlist1 = fake.makeRandomPlaylist();
      playlist2 = fake.makeRandomPlaylist();
      playlist1.show_id = show.id;
      playlist2.show_id = show.id;
      superagent.post(root + '/playlists')
      .send({playlist: playlist1})
      .end(function(e, res) {
        if (e) return console.log(e);
        playlist1 = res.body.new_playlist;

        superagent.post(root + '/playlists')
        .send({playlist: playlist2})
        .end(function(e, res) {
          if (e) return console.log(e);
          playlist2 = res.body.new_playlist;
          done();
        });
      });
    }); //  end before

    it('should return the proper number of playlists', function(done) {
      superagent.get(root + '/playlists?limit=1')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('playlists');
        expect(res.body.playlists).to.have.length(1);
        expect(res.body.playlists[0]).to.eql(playlist2);
        done();
      });

    }); //  end return proper #
  }); //  end describe query limiter
}); //  end describe playlists
