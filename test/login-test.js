var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('login', function() {
  var user;
  before(function(done) {
    superagent.post(root + '/users')
    .send({user: fake.makeRandomUser() })
    .end(function(e, res) {
      if (e) return console.log(e);
      user = res.body.new_user;
      done();
    });
  }); //  end before

  describe('logging in', function() {

    it('should create token', function(done) {
      superagent.post(root + '/login')
      .send({user_id: user.id, hash: user.hash})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.headers).to.have.key('x-access-token')
        expect(res.body).to.only.have.keys('loggedIn', 'token');
        expect(res.body.loggedIn).to.be.ok();
        done(); 
      });
    }); //  end should log in

    it('should catch missing params', function(done) {
      var badLogin = {user_id: user.id, hash: user.hash};
      var randomProp = utils.randomProperty('login');
      badLogin[randomProp] = null;
      superagent.post(root + '/login')
      .send({user_id: badLogin.user_id, hash: badLogin.hash})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.keys('error', 'loggedIn');
        expect(res.body.error).to.equal('Request body is missing required information');
        expect(res.body.loggedIn).to.not.be.ok();
        done();
      });
    }); //  end catch missing params

    it('should catch invalid user id', function(done) {
      var rand = fake.getRandomInt(1000, 100000);
      superagent.post(root + '/login')
      .send({user_id: rand, hash: user.hash})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.keys('error', 'loggedIn');
        expect(res.body.error).to.equal('User ' + rand + ' not found');
        expect(res.body.loggedIn).to.not.be.ok();
        done();
      })
    }); //  end catch invalid uid

    it('should catch bad password', function(done) {
      superagent.post(root + '/login')
      .send({user_id: user.id, hash: 'ldkhfdslkfhsldkfahdsfa'})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.only.have.keys('error', 'loggedIn');
        expect(res.body.error).to.equal('Incorrect password');
        expect(res.body.loggedIn).to.not.be.ok();
        done();
      })
    }); //  end catch invalid uid
  });
}); //  end describe login
