var express = require('express');
var shows = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Shows = require('../models/Show');
var api = require('../models/api');

var getCurrentTimeslot = require('../models/Show').getCurrentTimeslot;

//	for testing/dev only:
var faker = require('../test/fake');

/**	==========
*
*	/shows
*
*/

//	GET all shows in the table
shows.get('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		Shows.getAllShows(client, function(err, result) {
			//call `done()` to release the client back to the pool
      done();

      if (err) {
        res.json(500, {error: err});
      } else {
	      res.json(200, {shows: result});
      }

      client.end();	
		});	//	end Shows.getAllShows()
	});	//	end pg.connect
});

//	POST a new show to the table
shows.post('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		// TODO: when POSTing is set up on the client, uncomment the line below instead of makeRandomShow()
    // var show = req.body.show;
    var show = fake.makeRandomShow();
    Shows.addShow(client, show, function(err, result) {
      done();

      if (err) {
        res.json(500, {error: err});
      } else {
 	      res.json(201, {result: result.rowCount + " show created."});   	
      }

      client.end();
    });   //  end Shows.addShow
	});	//	end pg.connect
});

//	FIX ME: test this route
//	PUT an update to all shows in the table
shows.put('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, {error: err});
		}

		var updates = req.body.updates;
		Shows.updateAllShows(client, updates, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(200, {result: "updated " + result.length + " shows"});
			}

			client.end();
		});	//	end Shows.updateAllShows
	});	//	end pg.connect
});

//	DELETE all shows in the table
shows.delete('/', function(req, res) {
	pg.connect(db, function(err, client, done) {
    if (err) {
      return res.json(500, {error: err});
    }

    Shows.deleteAllShows(client, function(err, result) {
      done();

      if (err) {
        res.json(500, {error: err});
      } else {
        res.json(204, {result: "deleted " + result.rowCount + " shows"});
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
  pg.connect(db, function(err, client, done) {
    if (err) {
      return res.json(500, {error: err});
    }

  	var show_id = req.params.id;
    Shows.getShowById(client, show_id, function(err, result) {
      done();

      if (!err && result.length > 0) {
        res.json(200, {show: result[0]});
      } else if (result.length === 0) {
      	res.json(404, {error: "show " + show_id + " doesn't exist"});
      } else {
      	res.json(500, {error: err});
      }

      client.end();
    });
  });
});

//	FIX ME:  test this route
//	PUT an update to one show in the table
shows.put('/:id', function(req, res) {
  pg.connect(db, function(err, client, done) {
    if (err) {
      return res.json(500, {error: err});
    }

  	var show_id = req.params.id;
	  var updates = req.body.updates;
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
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		var show_id = req.params.id;
		api.get('/shows/' + show_id, function(err, result, statusCode) {
			if (err) {
				return res.json(500, {error: err});
			} else if (!err && result && statusCode === 200) {
				Shows.deleteShowById(client, show_id, function(err, result) {
					done();

					if (err) {
						res.json(500, {error: err});
					} else {

						//	FIX ME: why does the message not send even when the status code does
						//					and the action is completed?
						res.json(204, {message: "deleted show " + show_id});
					}

					client.end();
				});	//	end Users.delete
			} else {
				return res.json(statusCode, result);
			}
		});	//end api.get
	});	//	end pg.connect
});

/** ==========
*
*	advanced routes
*
*/

//	GET a list of currently active shows
//	(i.e, 0 <= shows.timeslot <= 167)
shows.get('/c/current', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			return res.json(500, {error: err});
		}

		Shows.getActiveShows(client, function(err, result) {
			done();

			if (err) {
				res.json(500, {error: err});
			} else {
				res.json(200, {active_shows: result});
			}

			client.end();
		});
	});
});

//	GET the show currently playing at the time of the request
shows.get('/n/now', function(req, res) {
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, err);
		}

		var timeslot = getCurrentTimeslot();
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
	pg.connect(db, function(err, client, done) {
		if (err) {
			res.json(500, {error:err});
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





