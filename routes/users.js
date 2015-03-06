var express = require('express');
var router = express.Router();

/**	==========
*
*	/users
*
*/

router.get('/', function(req, res) {
  res.json(200, {users: '/returns a list of all current users'});
});

router.post('/', function(req, res) {
	res.json(201, {user: '/returns the newly created user document'});
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
