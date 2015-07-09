var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('user route', function() {
  var numUsers;

  before(function(done) {
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
      numUsers = res.body.users.length;
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
        done();
      });
    });  // end retrieve new user

    it('should update the total number of users', function(done) {
      superagent.get(root + '/users')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.body).to.not.contain('error');
        expect(res.statusCode).to.equal(200);
        expect(res.body.users.length).to.equal(numUsers + 1);
        expect(res.body.users[0]).to.eql(newUser);
        done();
      });
    });  // end update total users

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

}); //  end user route
