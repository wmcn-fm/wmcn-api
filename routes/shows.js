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

			client.end();
		});	//	end Shows.updateAllShows
	});	//	end pg.connect
});

//	DELETE all shows in the table
shows.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
    
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

//	GET a list of currently active shows
//	(i.e, 0 <= shows.timeslot <= 167)
shows.get('/current', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		Shows.getActiveShows(client, function(err, result) {
			done();

			if (err) {
				res.json(500, err);
			} else {
				res.json(200, result);
				// res.json(200, {message: '/returns a list of all active shows'});
			}

			client.end();
		});
	});
});

//	GET the show currently playing at the time of the request
shows.get('/now', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		var timeslot = shows.getCurrentTimeslot();
		Shows.getShowByTimeslot(client, timeslot, function(err, result) {
			done();

			if (err) {
				res.json(500, err);
			}

			res.json(200, result);

			client.end();
		});

	})
});

//	GET a show by its timeslot (0 <= show.timeslot <= 167)
shows.get('/t/:timeslot', function(req, res) {
	var ts = req.params.timeslot;
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		Shows.getShowByTimeslot(client, ts, function(err, result) {
			done();

			if (err) {
				res.json(500, err);
			}

			res.json(200, result);
		});
	});
});

//	GET a show's hosts' user objects
shows.get('/:id/hosts', function(req, res) {
	var show_id = req.params.id;

	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		Shows.getHosts(client, show_id, function(err, result) {
			done();

			if (err) {
				res.json(500, err);
			}

			//	FIX ME: make additional call to Users.getUserById for
			//					each user Id returned, and return a list of userobjs
			res.json(200, result);
			// res.json(200, {message: '/returns the user documents associated with ' + id + 's show'});

			client.end();
		});
	});
});

module.exports = shows;





