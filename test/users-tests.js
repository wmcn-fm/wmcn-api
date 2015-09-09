var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('user route', function() {
  this.timeout(5000);
  var token1;
  var token2;
  var token3;
  var token4;
  before(function(done) {
    superagent.get(root + '/authenticate/dev')
    .query({id: 1, access: 1})
    .end(function(e, res) {
      if (e) return console.log(e);
      token1 = res.body.token;

      superagent.get(root + '/authenticate/dev')
      .query({id: 2, access: 2})
      .end(function(e, res) {
        if (e) return console.log(e);
        token2 = res.body.token;

        superagent.get(root + '/authenticate/dev')
        .query({id: 3, access: 3})
        .end(function(e, res) {
          if (e) return console.log(e);
          token3 = res.body.token;

          superagent.get(root + '/authenticate/dev')
          .query({id: 4, access: 4})
          .end(function(e, res) {
            if (e) return console.log(e);
            token4 = res.body.token;

            superagent.del(root + '/hosts')
            .set('x-access-token', token4)
            .end(function(e, res) {
              if (e) return console.log(e);
            });
            superagent.del(root + '/users')
            .set('x-access-token', token4)
            .end(function(e, res) {
              if (e) return console.log(e);
              done();
            });
          }); //  token4
        })  //  token3
      })  //  token2
    })  //  token1
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
    this.timeout(5000);
    var fakeUser;
    var newUser;
    before(function(done) {
      fakeUser = fake.makeRandomUser();
      done();
    });

    it('should deny no token/insufficient access', function(done) {
      superagent.post(root + '/users')
      .send({user: fakeUser})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(403);
        expect(res.body).to.only.have.keys('error', 'loggedIn');
        expect(res.body.loggedIn).to.not.be.ok();
        expect(res.body.error).to.equal('Access token required.');

        superagent.post(root + '/users')
        .send({user: fakeUser})
        .set('x-access-token', token1)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.equal('Request requires access level 3');
          done();
        });
      });
    }); //  end deny

    it('should add a new user', function (done) {
      superagent.post(root + '/users')
      .set('x-access-token', token3)
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
      .set('x-access-token', token1)
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
      .set('x-access-token', token4)
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
        .set('x-access-token', token3)
        .send({user: badUser})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.eql('user object is ' + badUser);
          expect(res.statusCode).to.equal(400);
          done();
        });
      }); //  end undefined

      it('should catch any missing column', function(done) {
        var randomProp = utils.randomProperty('user');
        badUser[randomProp] = null;
        superagent.post(root + '/users')
        .set('x-access-token', token3)
        .send({user: badUser})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(400);
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
      .set('x-access-token', token3)
      .end(function(e, res) {
        if (e) return console.log(e);
        show1 = res.body.new_show;
      });

      superagent.post(root + '/shows').send({show: show2})
      .set('x-access-token', token3)
      .end(function(e, res) {
        if (e) return console.log(e);
        show2 = res.body.new_show;
      });

      superagent.post(root + '/users').send({user: user})
      .set('x-access-token', token3)
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

    describe('adding a show', function() {
      it('should deny no token/insufficient access', function(done) {
        superagent.post(root + '/users/' + user.id + '/shows')
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.only.have.keys('error', 'loggedIn');
          expect(res.body.loggedIn).to.not.be.ok();
          expect(res.body.error).to.equal('Access token required.');

          superagent.post(root + '/users/' + user.id + '/shows')
          .set('x-access-token', token2)
          .end(function(e, res) {
            expect(e).to.eql(null);
            expect(res.statusCode).to.equal(403);
            expect(res.body).to.only.have.key('error');
            expect(res.body.error).to.equal('Request requires access level 3');
            done();
          });
        });
      }); //  end deny

      it('should add a show', function(done) {
        superagent.post(root + '/users/' + user.id + '/shows')
        .set('x-access-token', token3)
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
        .set('x-access-token', token3)
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
        .set('x-access-token', token4)
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
      }); //  end contain scond
    })  //  end describe adding a show
  });  // end referencing shows

  describe('current shows', function(done) {
    var user;
    var show1;
    var show2;
    var slot;

    before(function(done) {
      //  create a user
      superagent.post(root + '/users')
      .set('x-access-token', token4)
      .send({user: fake.makeRandomUser()})
      .end(function(e, res) {
        if (e) return console.log(e);
        user = res.body.new_user;

        //  create two shows
        superagent.post(root + '/shows')
        .set('x-access-token', token4)
        .send({show: fake.makeRandomShow()})
        .end(function(e, res) {
          if (e) return console.log(e);
          show1 = res.body.new_show;

          superagent.post(root + '/shows')
          .set('x-access-token', token4)
          .send({show: fake.makeRandomShow()})
          .end(function(e, res) {
            if (e) return console.log(e);
            show2 = res.body.new_show;

            //  add user as host
            superagent.post(root + '/users/' + user.id + '/shows')
            .set('x-access-token', token4)
            .send({show_id: show1.id})
            .end(function(e, res) {
              if (e) return console.log(e);

              superagent.post(root + '/users/' + user.id + '/shows')
              .set('x-access-token', token4)
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
      .set('x-access-token', token3)
      .send({show: slot})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.keys('show', 'scheduled_at');

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

  // describe('staff', function(err, ))
  describe('staff', function(err, result) {
    var user;
    var token;
    before(function(done) {
      superagent.post(root + '/users')
      .set('x-access-token', token3)
      .send({user: fake.makeRandomUser() })
      .end(function(e, res) {
        if (e) return console.log(e);
        user = res.body.new_user;

        superagent.post(root + '/authenticate')
        .send({user_id: user.id, hash: user.hash})
        .end(function(e, res) {
          if (e || !res.body.loggedIn) return console.log(e);
          token = res.body.token;
          done();
        })
      })
    }); //  end before


    it('should get public staff info only', function(done) {
      superagent.get(root + '/staff')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('staff');
        expect(res.body.staff.length).to.be.above(0)
        expect(res.body.staff[0]).to.not.have.keys('phone', 'hash', 'mac_id', 'iclass');
        done();
      })
    }); //  end get public staff info

    it('should get all info with token', function(done) {
      superagent.get(root + '/staff')
      .set('x-access-token', token)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('staff');
        expect(res.body.staff.length).to.be.above(0);
        expect(res.body.staff[0]).to.have.keys('phone', 'hash', 'mac_id', 'iclass');
        done();
      });
    }); //  end get all info

    it('shuld promote to level 3', function(done) {
      superagent.post(root + '/staff')
      .set('x-access-token', token4)
      .send({id: user.id, level: 3})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.keys('result', 'staff');
        expect(res.body.result).to.equal('Updated user ' + user.id + ' to access level 3');
        expect(res.body.staff[0].access).to.equal(3);
        done();
      });
    }); //  end promote
  });

}); //  end user route
