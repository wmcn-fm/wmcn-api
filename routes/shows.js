var express = require('express');
var router = express.Router();

/**	==========
*
*	/shows
*
*/

router.get('/', function(req, res) {
  res.json(200, {shows: '/returns a list of all current shows'});
});

router.post('/', function(req, res) {
	res.json(201, {show: '/returns the newly created show document'});
});

router.put('/', function(req, res) {
	res.json(200, {message: '/returns number of updated shows'});
});

router.delete('/', function(req, res) {
	res.json(200, {message: '/returns the id of the deleted show'});
});

/** ==========
*
*	/shows/:id
*
*/

router.get('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {show: '/returns ' + id + ' s show document'});
});

router.put('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {show: '/returns ' + id + ' s updated show document'});
});

router.delete('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {message: '/returns the id of the deleted user: ' + id});
});

/** ==========
*
*	advanced routes
*
*/

router.get('/active', function(req, res) {
	res.json(200, {message: '/returns a list of all active shows'});
});

router.get('/:id/hosts', function(req, res) {
	var id = req.params.id;
	res.json(200, {message: '/returns the user documents associated with ' + id + 's show'});
});

module.exports = router;