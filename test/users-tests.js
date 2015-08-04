var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('user route', function() {

  before(function(done) {
    superagent.del(root + '/hosts')
    .end(function(e, res) {
      if (e) return console.log(e);
    });
    superagent.del(root + '/users')
    .end(function(e, res) {
      if (e) return console.log(e);
      done();
    });
  }); //  end before

  it('should initially get an empty table', function (done) {
    superagent.get(root + '/users')
    .end(function (e,res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('No users found.');
      expect(res.body.users).to.be.empty();
      done();
    });
  }); //  end empty table

  describe('creating a new user', function() {
    var fakeUser;
    var newUser;
    before(function(done) {
      fakeUser = fake.makeRandomUser();
      done();
    });

    it('should add a new user', function (done) {
      superagent.post(root + '/users')
      .send({user: fakeUser})
      .end(function (e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(201);
        expect(res.body.result).to.eql('1 user created.');
        newUser = res.body.new_user;
        done();
      });
    }); //  end adds a new user

    it('should retrieve the new user', function(done) {
      superagent.get(root + '/users/' + newUser.id)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(res.body.user.id).to.eql(newUser.id);
        expect(res.body.user.email).to.eql(fakeUser.email);
        expect(res.body.user.access).to.equal(1);
        done();
      });
    });  // end retrieve new user

    it('should remove the new user', function(done) {
      superagent.del(root + '/users/' + newUser.id)
      .end(function(e, res){
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(res.body.message).to.eql('deleted user ' + newUser.id);

        superagent.get(root + '/users/' + newUser.id)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.eql(404);
          done();
        });
      });
    }); //  end remove new user

    describe('with missing data', function() {
      var badUser;
      before(function(done) {
        badUser = fake.makeRandomUser();
        done();
      });
      it('should catch undefined user', function(done) {
        var badUser;
        superagent.post(root + '/users')
        .send({user: badUser})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.eql('user object is ' + badUser);
          expect(res.statusCode).to.equal(403);
          done();
        });
      }); //  end undefined

      it('should catch any missing column', function(done) {
        var randomProp = utils.randomProperty('user');
        badUser[randomProp] = null;
        superagent.post(root + '/users')
        .send({user: badUser})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.eql(randomProp + ' field is missing');
          done();
        });
      });  // end catch missing col

    }); //  end submitting improper user

  }); //  end creating a new user

  describe('referencing shows', function(done) {
    var user;
    var show1;
    var show2;

    before(function(done) {
      user = fake.makeRandomUser();
      show1 = fake.makeRandomShow();
      show2 = fake.makeRandomShow();

      superagent.post(root + '/shows').send({show: show1})
      .end(function(e, res) {
        if (e) return console.log(e);
        show1 = res.body.new_show;
      });

      superagent.post(root + '/shows').send({show: show2})
      .end(function(e, res) {
        if (e) return console.log(e);
        show2 = res.body.new_show;
      });

      superagent.post(root + '/users').send({user: user})
      .end(function(e, res) {
        if (e) return console.log(e);
        user = res.body.new_user;

        done();
      });
  }); //  end before

    it('should initialize empty', function(done) {
      superagent.get(root + '/users/' + user.id + '/shows')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(404);
        expect(res.body.error).to.equal("User " + user.id + " hasn't hosted any shows");
        done();
      });
    }); //  end initialize empty

    it('should add a show', function(done) {
      superagent.post(root + '/users/' + user.id + '/shows')
      .send({show_id: show1.id })
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body.result).to.equal('Added user ' + user.id + ' to show ' + show1.id);
        done();
      });
    }); //  end add show

    it('should retrieve the new show', function(done) {
      superagent.get(root + '/users/' + user.id + '/shows')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('shows');
        expect(res.body.shows.length).to.equal(1);
        expect(res.body.shows[0]).to.eql(show1);
        done();
      });
    }); //  end retrieve new show

    it('should add another show', function(done) {
      superagent.post(root + '/users/' + user.id + '/shows')
      .send({show_id: show2.id})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body.result).to.equal('Added user ' + user.id + ' to show ' + show2.id);

        superagent.get(root + '/users/' + user.id + '/shows')
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.only.have.key('shows');
          expect(res.body.shows.length).to.equal(2);
          expect(res.body.shows[1]).to.eql(show2);
          done();
        });
      });
    }); //  end add another show

    it('should delete the first show', function(done) {
      superagent.del(root + '/users/' + user.id + '/shows')
      .send({show_id: show1.id})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body.result).to.equal("removed user " + user.id + " from show " + show1.id);
        done();
      });
    }); //  end delete first

    it('should only contain the second show', function(done) {
      superagent.get(root + '/users/' + user.id + '/shows')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('shows');
        expect(res.body.shows.length).to.equal(1);
        expect(res.body.shows[0]).to.eql(show2);
        done();
      });
    })

  });  // end referencing shows

  describe('current shows', function(done) {
    var user;
    var show1;
    var show2;
    var slot;

    before(function(done) {
      //  create a user
      superagent.post(root + '/users')
      .send({user: fake.makeRandomUser()})
      .end(function(e, res) {
        if (e) return console.log(e);
        user = res.body.new_user;

        //  create two shows
        superagent.post(root + '/shows')
        .send({show: fake.makeRandomShow()})
        .end(function(e, res) {
          if (e) return console.log(e);
          show1 = res.body.new_show;

          superagent.post(root + '/shows')
          .send({show: fake.makeRandomShow()})
          .end(function(e, res) {
            if (e) return console.log(e);
            show2 = res.body.new_show;

            //  add user as host
            superagent.post(root + '/users/' + user.id + '/shows')
            .send({show_id: show1.id})
            .end(function(e, res) {
              if (e) return console.log(e);

              superagent.post(root + '/users/' + user.id + '/shows')
              .send({show_id: show2.id})
              .end(function(e, res) {
                if (e) return console.log(e);
                done();
              });
            });
          });
        });
      });
    }); //  end before

    it('should initially be empty', function(done) {
      superagent.get(root + '/users/' + user.id + '/shows/current')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal("User " + user.id + " doesn't currently host any shows");
        done();
      });
    }); //  end intialize empty

    it('should return users current shows', function(done) {
      //  post first show to the schedule
      slot = {show_id: show1.id, timeslot: fake.getRandomInt(0, 167)};
      superagent.post(root + '/schedule')
      .send({show: slot})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.key('result');

        superagent.get(root + '/users/' + user.id + '/shows/current')
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.only.have.key('shows');
          expect(res.body.shows).to.have.length(1);
          expect(res.body.shows[0]).to.eql(show1);
          done();
        });
      });
    }); //  end return current shows
  });  // end current shows

}); //  end user route
