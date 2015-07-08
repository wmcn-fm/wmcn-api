var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');

describe('show route', function() {
  var numShows;

  before(function(done) {
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
      numShows = res.body.shows.length;
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

    it('should update the total number of shows', function(done) {
      superagent.get(root + '/shows')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.body).to.not.contain('error');
        expect(res.statusCode).to.equal(200);
        expect(res.body.shows.length).to.equal(numShows + 1);
        expect(res.body.shows[0]).to.eql(newShow);
        done();
      });
    });  // end update total shows

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
  }); //  end creating a new show

}); //  end show route