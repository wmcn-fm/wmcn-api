var express = require('express');
var router = express.Router();

//  require user methods and database connection
var Users = require('../models/User');
var pg = require('pg');
var user = process.env.USER;
var pw = process.env.PW;
var conString = "postgres://" + user + ":" + pw + "@localhost/SUP";

//  for testing/development only:
var makeRandomUser = require('../test/utils').makeRandomUser;

/**	==========
*
*	/users
*
*/

router.get('/', function(req, res) {
  pg.connect(conString, function(err, client, done) {
    if(err) {
      res.json(500, err);
    }

    Users.getAllUsers(client, function(err, result) {
      //call `done()` to release the client back to the pool
      done();

      if (err) {
        res.json(500, err);
      }
      // console.log('success!\t', result);
      res.json(200, result);

      client.end();
    }); //  end Users.getAllUsers
  }); //  end pg.connect
});

//add new user
router.post('/', function(req, res) {
  pg.connect(conString, function(err, client, done) {

    if (err) {
      res.json(500, err);
    }

    // TODO: when POSTing is set up on the client, uncomment the line below instead of makeRandomUser()
    // var usrObj = req.body;
    var usrObj = makeRandomUser();

    Users.addUser(client, usrObj, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      }

      // console.log('success!\t', result);
      res.json(200, "done.");

      client.end();
    });   //  end Users.addUser
  }); //  end pg.connect
});

router.put('/', function(req, res) {
	res.json(200, {message: '/returns number of updated users'});
});

router.delete('/', function(req, res) {
	res.json(200, {message: '/returns the id of the deleted user'});
});

/** ==========
*
*	/users/:id
*
*/

router.get('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {user: '/returns ' + id + ' s user document'});
});

router.put('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {user: '/returns ' + id + ' s updated user document'});
});

router.delete('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {message: '/returns the id of the deleted user: ' + id});
});



module.exports = router;
