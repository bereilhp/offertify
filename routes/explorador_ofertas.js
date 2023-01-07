const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Cargamos las ofertas activas de todos los dueños
  
  res.render('explorador_ofertas', { title: 'Explorador Ofertas' });
});

module.exports = router;
