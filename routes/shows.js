var express = require('express');
var shows = express.Router();
var pg = require('pg');
var config = require('../config/config')();
var db = config.db;
var Shows = require('../models/Show');
var api = require('../models/api');

//	for testing/dev only:
var faker = require('../test/fake');


shows.route('/')

  //	GET all shows in the table
  .get(function(req, res) {
  	pg.connect(db, function(err, client, done) {
  		if (err) {
  			return res.json(500, {error: err});
  		}

  		Shows.getAllShows(client, function(err, result) {
  			//call `done()` to release the client back to the pool
        done();

        if (err) {
          res.json(500, {error: err.detail});
        } else if (result.length === 0) {
          res.json(404, {error: "No shows found.", shows: result});
        } else {
          res.json(200, {shows: result});
        }

        client.end();
  		});	//	end Shows.getAllShows()
  	});	//	end pg.connect
  })

  //	POST a new show to the table
  .post(function(req, res) {
  	pg.connect(db, function(err, client, done) {
  		if (err) {
  			return res.json(500, {error: err});
  		}


      var show;
      if (process.env.NODE_ENV === 'production') {
        show = req.body.show;
      } else {
        show = faker.makeRandomShow();
      }

      Shows.addShow(client, show, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err.detail});
        } else {
   	      res.json(201,
             {
               "result": result.rowCount + " show created.",
               "new_id": result.rows[0].id
             }
          );
        }

        client.end();
      });   //  end Shows.addShow
  	});	//	end pg.connect
  })

  //	PUT an update to all shows in the table
  .put(function(req, res) {
    res.json(500, {error: 'not configured'});
  	// pg.connect(db, function(err, client, done) {
  	// 	if (err) {
  	// 		res.json(500, {error: err});
  	// 	}

  	// 	var updates = req.body.updates;
  	// 	Shows.updateAllShows(client, updates, function(err, result) {
  	// 		done();

  	// 		if (err) {
  	// 			res.json(500, {error: err});
  	// 		} else {
  	// 			res.json(200, {result: "updated " + result.length + " shows"});
  	// 		}

  	// 		client.end();
  	// 	});	//	end Shows.updateAllShows
  	// });	//	end pg.connect
  })

  //	DELETE all shows in the table
  .delete(function(req, res) {
  	pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

      Shows.deleteAllShows(client, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err.detail});
        } else {
          res.json(200, {result: "deleted " + result.rowCount + " shows"});
        }

        client.end();
      });  // end Shows.delete
    }); //  end pg.connect
  });



shows.route('/:id')

  //	GET one show in the table by its ID
  .get(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) {
        return res.json(500, {error: err});
      }

    	var show_id = req.params.id;
      Shows.getShowById(client, show_id, function(err, result) {
        done();

        if (!err && result.length > 0) {
          res.json(200, {show: result[0]});
        } else if (!err) {
        	res.json(404, {error: "show " + show_id + " doesn't exist"});
        } else {
        	res.json(500, {error: err});
        }

        client.end();
      });
    });
  })

  //	PUT an update to one show in the table
  .put(function(req, res) {
    res.json(500, {error: 'not configured'});
  })

  .delete(function(req, res) {
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
  						res.json(500, {error: err.detail});
  					} else {

  						//	FIX ME: why does the message not send even when the status code does
  						//					and the action is completed?
  						res.json(200, {message: "deleted show " + show_id});
  					}

  					client.end();
  				});	//	end Users.delete
  			} else {
  				return res.json(statusCode, result);
  			}
  		});	//end api.get
  	});	//	end pg.connect
  });


shows.get('/:id/playlists', function(req, res) {
  pg.connect(db, function(err, client, done) {
    if (err) {
      return res.json(500, {error: err});
    }

    var show_id = req.params.id;
    api.get('/shows/' + show_id, function(err, result, statusCode) {
      if (err) {
        return res.json(500, {error: err});
      } else if (!err && result && statusCode === 200) {

        if (!req.query.limit) {

          Shows.getAllPlaylists(client, show_id, function(err, result) {
            if (err) {
              res.json(500, {error: err});
            } else if (result.length === 0) {
              res.json(404, {error: "show " + show_id + " hasn't posted any playlists"});
            } else {
              res.json(200, {playlists: result});
            }
          }); //end getPlaylists
        } else {

          var limit = parseInt(req.query.limit);
          Shows.getPlaylists(client, show_id, limit, function(err, result) {
            if (err) {
              res.json(500, {error: err});
            } else if (result.length === 0) {
              res.json(404, {error: "show " + show_id + " hasn't posted any playlists"});
            } else {
              res.json(200, {playlists: result});
            }
          });
        }

      } else {
        return res.json(statusCode, result);
      }
    }); //  end api.get
  });
});

//	GET a show's hosts' user objects
shows.route('/:id/hosts')
  .get(function(req, res) {
  	pg.connect(db, function(err, client, done) {
  		if (err) {
  			return res.json(500, {error:err});
  		}

      var show_id = req.params.id;
  		Shows.getHosts(client, show_id, function(err, result) {
  			done();

        if (!err && result.length > 0) {
          res.json(200, {hosts: result});
        } else if (!err) {
          res.json(404, {error: "show " + show_id + " has no listed hosts"});
        } else {
          res.json(500, {error: err});
        }

  			client.end();
  		});
  	});
  })

  .post(function(req, res) {
    pg.connect(db, function(err, client, done) {
      if (err) return res.json(500, {error: err});

      var show_id = req.params.id;
      var host_id = req.body.host_id;
      Shows.addHost(client, show_id, host_id, function(err, result) {
        done();

        if (err) {
          res.json(500, {error: err.detail});
        } else {
          res.json(201, {result: "Added user " + host_id + " to show " + show_id});
        }

        client.end();
      }); //  end Show.
    }); //  end pg.connect
  })

module.exports = shows;
