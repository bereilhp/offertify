const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const LocalTableGateway = require('../database/localTableGateway');
const localTableGateway = new LocalTableGateway();

let pendingCallbacks = 0;

/* GET home page. */
router.get('/', function(req, res, next) {
  // Cargamos las ofertas activas de todos los dueños
  ofertaTableGateway.loadAllActiveOfertas(function(err, ofertas) {
    // Obtenemos el nombre de los locales asociados a cada oferta
    pendingCallbacks = ofertas.length;
    ofertas.forEach((oferta) => {
      localTableGateway.loadVenue(oferta.)
    });

    res.render('explorador_ofertas', { title: 'Explorador Ofertas', ofertas });
  });
});

module.exports = router;
