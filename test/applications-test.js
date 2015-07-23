var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('applications', function() {
  before(function(done) {
    superagent.del(root + '/applications')
    .end(function(e, res) {
      if (e) return console.log(e);
      done();
    });
  }); //  end before

  it('should initialize empty', function(done) {
    superagent.get(root + '/applications')
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
        expect(res.statusCode).to.equal(403);
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
        expect(res.statusCode).to.equal(403);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.eql(randomProp + ' field is missing');
        done();
      });
    }); //  end catch missing columns
  }); //  end describe posting an app

}); //  end describe applications
