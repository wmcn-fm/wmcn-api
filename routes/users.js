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

//  GET all users
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

//  POST a new user
router.post('/', function(req, res) {
  pg.connect(conString, function(err, client, done) {

    if (err) {
      res.json(500, err);
    }

    // TODO: when POSTing is set up on the client, uncomment the line below instead of makeRandomUser()
    // var usrObj = req.body.user;
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


//  PUT all users
router.put('/', function(req, res) {
  var updates = req.body.updates;

  pg.connect(conString, function(err, client, done) {
    if (err) {
      res.json(500, err);
    }

    Users.updateAllUsers(client, updates, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      }

      res.json(200, result);

      client.end();
    });
  });
});


//  DELETE all users
router.delete('/', function(req, res) {
  pg.connect(conString, function(err, client, done) {
    done();
    
    if (err) {
      res.json(500, err);
    }

    Users.deleteAllUsers(client, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      } else {
        res.json(200, result);
      }

      client.end();
    });  // end Uesrs.delete
  }); //  end pg.connect
});

/** ==========
*
*	/users/:id
*
*/

router.get('/:id', function(req, res) {
	var user_id = req.params.id;

  pg.connect(conString, function(err, client, done) {
    if (err) {
      res.json(500, err);
    }

    Users.getUserById(client, user_id, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      }

      res.json(200, result);
      // res.json(200, {user: '/returns ' + id + ' s user document'});
      client.end();
    });
  });
});

router.put('/:id', function(req, res) {
	var user_id = req.params.id;
  var updates = req.body.updates;

  pg.connect(conString, function(err, client, done) {
    if (err) {
      res.json(500, err);
    }

    Users.updateUserById(client, user_id, updates, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      } else {
        res.json(200, result);
        // res.json(200, {user: '/returns ' + id + ' s updated user document'});
      }

      client.end();
    });
  });
});

router.delete('/:id', function(req, res) {
	var user_id = req.params.id;

  pg.connect(conString, function(err, client, done) {
    if (err) {
      res.json(500, err);
    }

    Users.deleteUserById(client, user_id, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      } else {
        res.json(200, result);
        // res.json(200, {message: '/returns the id of the deleted user: ' + id});
      }

      client.end();
    });
  });
});


module.exports = router;