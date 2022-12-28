const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('interfaz_admin', { title: 'interfaz_admin' });
});

module.exports = router;