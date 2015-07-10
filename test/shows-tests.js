var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

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
          expect(res.statusCode).to.equal(403);
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
          expect(res.statusCode).to.equal(403);
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

  // it("should get one show's hosts", function(done){
  //   utils.getValid('shows', function(err, showId) {
  //     if (err) return console.log(err);
  //     superagent.get('/shows/' + showId + '/hosts')
  //     .end(function(e, res){
  //       expect(e).to.eql(null);
  //       expect(res.statusCode).to.eql(200);
  //       expect(typeof res.body).to.eql('object');
  //       done();
  //     });
  //   });
  // });
  //
  // it("adds a user as a show's host", function(done) {
  //   utils.getValid('shows', function(err, showId) {
  //     if (err) return console.log(err);
  //     utils.getValid('users', function(err, host_id) {
  //       if (err) return console.log(err);
  //
  //       superagent.post('/shows/' + showId + '/hosts')
  //       .send({host_id: host_id})
  //       .end(function(e, res) {
  //         expect(e).to.eql(null);
  //         expect(res.statusCode).to.equal(201);
  //         expect(res.body.result).to.eql("Added user " + host_id + "to show" + newerId);
  //         done();
  //       });
  //
  //     });
  //   });
  // });

}); //  end show route
