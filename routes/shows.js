var express = require('express');
var shows = express.Router();

var Shows = require('../models/Show');
var pg = require('pg');
var db = require('../db-connect');

//	for testing/dev only:
var makeRandomShow = require('../test/utils').makeRandomShow;

/**	==========
*
*	/shows
*
*/

//	GET all shows in the table
shows.get('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		Shows.getAllShows(client, function(err, result) {
			//call `done()` to release the client back to the pool
      done();

      if (err) {
        res.json(500, err);
      }
      // console.log('success!\t', result);
      res.json(200, result);
      // res.json(200, {shows: '/returns a list of all current shows'});

      client.end();	
		});	//	end Shows.getAllShows()
	});	//	end pg.connect
});

//	POST a new show to the table
shows.post('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		// TODO: when POSTing is set up on the client, uncomment the line below instead of makeRandomUser()
    // var newShow = req.body.show;
    var newShow = makeRandomShow();

    Shows.addShow(client, newShow, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      }

      // console.log('success!\t', result);
      res.json(201, result);
    	// res.json(201, {show: '/returns the newly created show document'});

      client.end();
    });   //  end Shows.addShow
	});	//	end pg.connect
});

//	PUT an update to all shows in the table
shows.put('/', function(req, res) {
	var updates = req.body.updates;

	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		Shows.updateAllShows(client, updates, function(err, result) {
			done();

			if (err) {
				res.json(500, err);
			} else {
				res.json(200, result.length);
				// res.json(200, {message: '/returns number of updated shows'});
			}
		});	//	end Shows.updateAllShows
	});	//	end pg.connect
});

//	DELETE all shows in the table
shows.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
    done();
    
    if (err) {
      res.json(500, err);
    }

    Shows.deleteAllShows(client, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      } else {
        res.json(200, result.length);
      	// res.json(200, {message: '/returns the id of the deleted show'});
      }

      client.end();
    });  // end Shows.delete
  }); //  end pg.connect
});

/** ==========
*
*	/shows/:id
*
*/

//	GET one show in the table by its ID
shows.get('/:id', function(req, res) {
	var show_id = req.params.id;

  pg.connect(db, function(err, client, done) {
    if (err) {
      res.json(500, err);
    }

    Shows.getShowById(client, show_id, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      }

      res.json(200, result);
      // res.json(200, {user: '/returns ' + id + ' s show document'});
      client.end();
    });
  });
});

//	PUT an update to one show in the table
shows.put('/:id', function(req, res) {
	var show_id = req.params.id;
  var updates = req.body.updates;

  pg.connect(db, function(err, client, done) {
    if (err) {
      res.json(500, err);
    }

    Shows.updateShowById(client, show_id, updates, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      } else {
        res.json(200, result);
        // res.json(200, {user: '/returns ' + id + ' s updated show document'});
      }

      client.end();
    });
  });
	// res.json(200, {show: '/returns ' + id + ' s updated show document'});
});

shows.delete('/:id', function(req, res) {
	var show_id = req.params.id;

  pg.connect(db, function(err, client, done) {
    if (err) {
      res.json(500, err);
    }

    Shows.deleteShowById(client, show_id, function(err, result) {
      done();

      if (err) {
        res.json(500, err);
      } else {
        res.json(200, result);
      	// res.json(200, {message: '/returns the id of the deleted show: ' + id});
      }

      client.end();
    });
  });
});

/** ==========
*
*	advanced routes
*
*/

shows.get('/active', function(req, res) {
	res.json(200, {message: '/returns a list of all active shows'});
});

shows.get('/:id/hosts', function(req, res) {
	var id = req.params.id;
	res.json(200, {message: '/returns the user documents associated with ' + id + 's show'});
});

module.exports = shows;