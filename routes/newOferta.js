const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('newOferta', { title: 'Añadir Oferta' });
});

module.exports = router;