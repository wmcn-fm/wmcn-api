var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('applications', function() {
  var user;
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

            superagent.del(root + '/applications')
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

  it('should initialize empty', function(done) {
    superagent.get(root + '/applications')
    .set('x-access-token', token2)
    .end(function(e, res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.only.have.keys('error', 'applications');
      expect(res.body.applications).to.be.empty();
      expect(res.body.error).to.equal('No applications found');
      done();
    });
  }); //  end init empty


  describe('posting', function() {
    var submitted;
    var app;
    before(function(done) {
      submitted = fake.makeRandomApp();
      done();
    });

    it ('should post an application', function(done) {
      superagent.post(root + '/applications')
      .send({app: submitted })
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.keys('result', 'new_app');
        expect(res.body.result).to.equal('1 application created');
        expect(res.body.new_app.email).to.eql(submitted.email);
        app = res.body.new_app;
        done();
      });
    }); //  end post an application

    it('should catch undefined app', function(done) {
      var badApp;
      superagent.post(root + '/applications')
      .send({app: badApp})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.eql('app object is ' + badApp);
        done();
      });
    }); //  end catch undefined app

    it('should catch any missing columns', function(done) {
      var badApp = fake.makeRandomApp();
      var randomProp = utils.randomProperty('app');
      badApp[randomProp] = null;
      superagent.post(root + '/applications')
      .send({app: badApp})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.eql('Application is missing information');
        done();
      });
    }); //  end catch missing columns


    it('should catch user info discrepancy', function(done) {
      var badApp = fake.makeRandomApp();
      var randomProp = utils.randomProperty('user');
      badApp[randomProp].splice(0, 1);
      superagent.post(root + '/applications/')
      .send({app: badApp})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal('Application is missing information');
        done();
      });
    });
  }); //  end describe posting an app

  describe('retrieving', function() {
    var app;
    before(function(done) {
      superagent.post(root + '/applications')
      .send({app: fake.makeRandomApp() })
      .end(function(e, res) {
        if (e) return console.log(e);
        app = res.body.new_app;
        done();
      });
    }); //  end before

    describe('all apps', function() {
      it('should deny no token/insufficient access', function(done) {
        superagent.get(root + '/applications')
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.only.have.keys('error', 'loggedIn');
          expect(res.body.loggedIn).to.not.be.ok();
          expect(res.body.error).to.equal('Access token required.');

          superagent.get(root + '/applications')
          .set('x-access-token', token1)
          .end(function(e, res) {
            expect(e).to.eql(null);
            expect(res.statusCode).to.equal(403);
            expect(res.body).to.only.have.key('error');
            expect(res.body.error).to.equal('Request requires access level 2');
            done();
          });
        });
      }); //  end deny

      it('should get all apps', function(done) {
        superagent.get(root + '/applications')
        .set('x-access-token', token2)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.only.have.key('applications');
          expect(res.body.applications.length).to.be.above(1);
          done();
        });
      })  //  end get all
    }); //  end describe all apps


    describe('single app', function() {
      it('should deny no token/insufficient access', function(done) {
        superagent.get(root + '/applications/' + app.id)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.only.have.keys('error', 'loggedIn');
          expect(res.body.loggedIn).to.not.be.ok();
          expect(res.body.error).to.equal('Access token required.');

          superagent.get(root + '/applications/' + app.id)
          .set('x-access-token', token1)
          .end(function(e, res) {
            expect(e).to.eql(null);
            expect(res.statusCode).to.equal(403);
            expect(res.body).to.only.have.key('error');
            expect(res.body.error).to.equal('Request requires access level 2');
            done();
          });
        });
      }); //  end deny

      it('should retrieve an application', function(done) {
        superagent.get(root + '/applications/' + app.id)
        .set('x-access-token', token2)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.only.have.key('application');
          expect(res.body.application).to.eql(app);
          done();
        });
      }); //  end retrieve an app

      it('should catch nonexistent apps', function(done) {
        var badId = app.id + 1;
        superagent.get(root + '/applications/' + badId)
        .set('x-access-token', token2)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(404);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.eql("Couldn't find app with id " + badId);
          done();
        });
      }); //  end catch nonexistent

    })

  }); //  end describe retrieving

  describe('deleting', function() {
    var app1;
    var app2;
    before(function(done) {
      superagent.post(root + '/applications')
      .send({app: fake.makeRandomApp() })
      .end(function(e, res) {
        if (e) return console.log(e);
        app1 = res.body.new_app;

        superagent.post(root + '/applications')
        .send({app: fake.makeRandomApp() })
        .end(function(e, res) {
          if (e) return console.log(e);
          app2 = res.body.new_app;
          done();
        });
      });
    }); //  end before

    describe('single app', function() {
      it('should deny no token/insufficient access', function(done) {
        superagent.del(root + '/applications/' + app1.id)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.only.have.keys('error', 'loggedIn');
          expect(res.body.loggedIn).to.not.be.ok();
          expect(res.body.error).to.equal('Access token required.');

          superagent.del(root + '/applications/' + app1.id)
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

      it('should delete one app', function(done) {
        superagent.del(root + '/applications/' + app1.id)
        .set('x-access-token', token3)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.only.have.key('result');
          expect(res.body.result).to.equal('1 app with id ' + app1.id + ' deleted.');
          done();
        });
      }); //  end delete one
    });

    describe('all apps', function() {
      it('should deny no token/insufficient access', function(done) {
        superagent.del(root + '/applications')
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.only.have.keys('error', 'loggedIn');
          expect(res.body.loggedIn).to.not.be.ok();
          expect(res.body.error).to.equal('Access token required.');

          superagent.del(root + '/applications')
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

      it('should delete all apps', function(done) {
        superagent.del(root + '/applications')
        .set('x-access-token', token3)
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.only.have.keys('result', 'num_deleted');
          expect(res.body.num_deleted).to.be.above(0);
          done();
        });
      }); //  end delete all

    }); //  end describe all apps

  }); //  end describe deleting

  describe('approving', function() {
    var app;
    before(function(done) {
      superagent.post(root + '/applications')
      .send({app: fake.makeRandomApp() })
      .end(function(e, res) {
        if (e) return console.log(e);
        app = res.body.new_app;
        done();
      });
    }); //  end before

    it('should deny no token/insufficient access', function(done) {
      superagent.post(root + '/applications/' + app.id + '/approve')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(403);
        expect(res.body).to.only.have.keys('error', 'loggedIn');
        expect(res.body.loggedIn).to.not.be.ok();
        expect(res.body.error).to.equal('Access token required.');

        superagent.post(root + '/applications/' + app.id + '/approve')
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

    it('should approve an app', function(done) {
      superagent.post(root + '/applications/' + app.id + '/approve')
      .set('x-access-token', token3)
      .send({app: app, timeslot: fake.getRandomInt(0, 167)})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.key('result');

        var result = res.body.result;
        expect(result).to.only.have.keys('users', 'num_hosts', 'timeslot', 'show');
        expect(result.users).to.be.an('array');
        expect(result.num_hosts).to.be.a('number');
        expect(result.timeslot).to.be.within(0, 168);
        expect(result.show).to.be.an('object');
        expect(result.users).to.have.length(result.num_hosts);

        superagent.get(root + '/shows/' + result.show.id + '/hosts')
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.only.have.key('hosts');
          expect(res.body.hosts).to.eql(result.users);

          superagent.get(root + '/schedule/' + result.timeslot)
          .end(function(e, res) {
            expect(e).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.only.have.key('show');
            expect(res.body.show).to.eql(result.show);
            done();
          });
        })
      });
    });



  }); //  end describe approving

}); //  end describe applications
