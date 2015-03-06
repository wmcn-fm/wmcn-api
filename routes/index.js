var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.json(200, 'welcome to wmcn api');
});

module.exports = router;
