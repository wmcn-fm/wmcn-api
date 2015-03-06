var express = require('express');
var router = express.Router();

/**	==========
*
*	/playlists
*
*/

router.get('/', function(req, res) {
  res.json(200, {shows: '/returns a list of all playlists'});
});

router.post('/', function(req, res) {
	res.json(201, {playlist: '/returns the newly created pl document'});
});

router.put('/', function(req, res) {
	res.json(200, {message: '/returns number of updated playlists'});
});

router.delete('/', function(req, res) {
	res.json(200, {message: '/returns the id of the deleted playlist'});
});

/** ==========
*
*	/playlists/:id
*
*/

router.get('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {playlist: '/returns ' + id + ' s playlist document'});
});

router.put('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {playlist: '/returns ' + id + ' s updated playlist document'});
});

router.delete('/:id', function(req, res) {
	var id = req.params.id;
	res.json(200, {message: '/returns the id of the deleted playlist: ' + id});
});

module.exports = router;