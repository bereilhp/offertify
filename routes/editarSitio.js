const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('editarSitio', { title: 'editarSitio' });
});

module.exports = router;