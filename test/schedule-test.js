var superagent = require('superagent');
var expect = require('expect.js');
var config = require('../config/config')();
var root = config.api_root_url;
var fake = require('./fake');
var utils = require('./utils');

describe('schedule', function() {
  var token1;
  var token2;
  var token3;
  var token4;
  var show;
  var submitted;
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

            superagent.del(root + '/schedule')
            .set('x-access-token', token4)
            .end(function(e, res) {
              if (e) return console.log(e);

              superagent.post(root + '/shows')
              .set('x-access-token', token3)
              .send({show: fake.makeRandomShow()})
              .end(function(e, res) {
                if (e) return console.log(e);
                show = res.body.new_show;
                done();
              });
            });

          }); //  token4
        })  //  token3
      })  //  token2
    })  //  token1
  }); //  end before

  it('should initially be blank', function(done) {
    superagent.get(root + '/schedule')
    .end(function (e,res) {
      expect(e).to.eql(null);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.only.have.key('schedule');
      for (var time in res.body.schedule) {
        expect(res.body.schedule[time].show).to.equal('automator');
      }
      done();
    });
  });

  describe('scheduling a show', function() {
    it('should schedule a show', function(done) {
      submitted = {timeslot: fake.getRandomInt(0, 167), show_id: show.id};

      superagent.post(root + '/schedule')
      .set('x-access-token', token3)
      .send({show: submitted})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.only.have.key('result');
        expect(res.body.result).to.equal('Added show ' + submitted.show_id + ' at timeslot ' + submitted.timeslot);
        done();
      });
    }); //  end schedule show

    it('should catch invalid show id', function(done) {
      var slot = {timeslot: fake.getRandomInt(0, 167),show_id: 1000};
      superagent.post(root + '/schedule')
      .set('x-access-token', token3)
      .send({show: slot})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(500);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal('Key (show_id)=(1000) is not present in table "shows".');
        done();
      });
    }); //  end invalid show_id

    it('should catch invalid timeslot', function(done) {
      var slot = {timeslot: fake.getRandomInt(168, 2000), show_id: show.id};
      superagent.post(root + '/schedule')
      .set('x-access-token', token3)
      .send({show: slot})
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(500);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal('Failing row contains (' + slot.timeslot + ', ' + show.id + ').');
        done();
      });
    }); //  end invalid show_id

    it('should catch missing show_id', function(done) {
        var slot = {timeslot: fake.getRandomInt(0, 167), show_id: null};
        superagent.post(root + '/schedule')
        .set('x-access-token', token3)
        .send({show: slot})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(500);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.equal('Failing row contains (' + slot.timeslot + ', ' + slot.show_id + ').');
          done();
        });
    });

    it('should catch missing timeslot', function(done) {
        var slot = {timeslot: null, show_id: show.id};
        superagent.post(root + '/schedule')
        .set('x-access-token', token3)
        .send({show: slot})
        .end(function(e, res) {
          expect(e).to.eql(null);
          expect(res.statusCode).to.equal(500);
          expect(res.body).to.only.have.key('error');
          expect(res.body.error).to.equal('Failing row contains (' + slot.timeslot + ', ' + slot.show_id + ').');
          done();
        });
    });
  }); //   end posting

  describe('querying a timeslot', function() {

    it('should retrieve the correct show', function(done) {
      superagent.get(root + '/schedule/' + submitted.timeslot)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('show');
        expect(res.body.show.id).to.eql(show.id);
        done();
      });
    }); //  end retrieve correct show

    it('should handle unscheduled slots', function(done) {
      superagent.get(root + '/schedule/0')
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.only.have.keys('error', 'show');
        expect(res.body.error).to.equal('no show exists at hour 0');
        expect(res.body.show).to.equal('automator');
        done();
      });
    }); //  end unfilled

    it('should handle out of range slot', function(done) {
      var badTs = fake.getRandomInt(168, 2000);
      superagent.get(root + '/schedule/' + badTs)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal('timeslot ' + badTs + ' is out of range 0-167');
        done();
      });
    }); //  end out of range

    it('should handle invalid timeslot', function(done) {
      var badTs = 'xqZ';
      superagent.get(root + '/schedule/' + badTs)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal('timeslot ' + badTs + ' is out of range 0-167');
        done();
      });
    }); //  end invalid ts
  }); //  end retrieving

  describe('deleting a scheduled slot', function() {
    var show;
    var slot;
    before(function(done) {
      superagent.post(root + '/shows')
      .set('x-access-token', token3)
      .send({show: fake.makeRandomShow()})
      .end(function(e, res) {
        if (e) return console.log(e);
        show = res.body.new_show;
        slot = {timeslot: fake.getRandomInt(0, 167), show_id: show.id};
        superagent.post(root + '/schedule')
        .set('x-access-token', token3)
        .send({show: slot})
        .end(function(e, res) {
          if (e) return console.log(e);
          done();
        });
      });
    }); //  end before

    it('should remove the show from the schedule...', function() {
      superagent.del(root + '/schedule/' + slot.timeslot)
      .set('x-access-token', token4)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.only.have.key('result');
        expect(res.body.result).to.equal("cleared slot " + slot.timeslot );
      });
    }); //  end delete show

    it('...but keep the show itself', function(done) {
      superagent.get(root + '/shows/' + slot.show_id)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(200);
        expect(res.body.show.id).to.equal(slot.show_id );
        done();
      });
    }); //  end delete show

    it('should handle unscheduled slots', function(done) {
      superagent.del(root + '/schedule/' + slot.timeslot)
      .set('x-access-token', token4)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal("timeslot " + slot.timeslot + " is empty");
        done();
      });
    }); //  end delete show

    it('should handle faulty params', function(done) {
      superagent.del(root + '/schedule/xyz')
      .set('x-access-token', token4)
      .end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.only.have.key('error');
        expect(res.body.error).to.equal("timeslot xyz is out of range 0-167");
        done();
      });
    }); //  end delete show
  }); //  end deleting

}); //  end test
