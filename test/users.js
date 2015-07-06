var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;

describe('wmcn api server', function() {
  var id = process.env.ID;

  it('gets all users', function (done) {
    superagent.get(root + '/users')
    .end(function (e,res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(res.body.users.length).to.be.above(0);
      done();
    });
  });

  it('adds a new user', function (done) {
    superagent.post(root + '/users')
    .end(function (e, res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.eql(201);
      expect(res.body.result).to.eql('1 user created.');
      var new_id = res.body.new_id;
      superagent.get(root + '/users/' + new_id)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(res.body.user.id).to.eql(new_id);
        done();
      });
    });
  });

  it('gets one user', function (done) {
    superagent.get(root + '/users/' + id)
    .end(function (e, res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(typeof res.body).to.eql('object');
      done();
    });
  });
  //
  // it('updates a user', function (done) {
  //   superagent.put('http://localhost:3000/users/' + id)
  //   // .send({
  //   //   id: id,
  //   //   firstName: 'test',
  //   //   lastName: 'Test'})
  //   .end(function (e, res) {
  //     // console.log(res.body);
  //     expect(e).to.eql(null);
  //     expect(res.statusCode).to.eql(200);
  //     expect(typeof res.body).to.eql('object');
  //     expect(res.body.message).to.eql('User updated');
  //     done();
  //   });
  // });
  //


  it('removes a user', function(done){
    superagent.del(root + '/users/' + id)
    .end(function(e, res){
      expect(e).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(res.body.message).to.eql('deleted user ' + id);

      superagent.get(root + '/users/' + id)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.eql(404);
        done();
      });
    });
  });
});
