var express = require('express');
var router = express.Router();

/**	==========
*
*	/applications
*
*/

router.get('/', function(req, res) {
  res.json(200, {shows: '/returns a list of all outstanding applications'});
});

router.post('/', function(req, res) {
	res.json(201, {show: '/returns the newly created application document'});
});

router.put('/', function(req, res) {
	res.json(200, {message: '/returns number of updated apps'});
});

router.delete('/', function(req, res) {
	res.json(200, {message: '/returns the id of the deleted app'});
});

/** ==========
*
*	/applications/:id
*
*/

router.get('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {application: '/returns ' + id + ' s app document'});
});

router.put('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {application: '/returns ' + id + ' s updated application document'});
});

router.delete('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {message: '/returns the id of the deleted app: ' + id});
});

/** ==========
*
*	advanced routes
*
*/

router.get('/active', function(req, res) {
	res.json(200, {message: '/returns a list of all active apps'});
});

router.get('/:id/hosts', function(req, res) {
	var id = req.params.id;
	res.json(200, {message: '/returns the user documents associated with ' + id + 's show'});
});

module.exports = router;