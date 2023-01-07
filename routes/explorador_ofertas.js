const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const LocalTableGateway = require('../database/localTableGateway');
const localTableGateway = new LocalTableGateway();

let ofertas = [];
let pendingCallbacks = 0;

/* GET home page. */
router.get('/', function(req, res, next) {
  // Cargamos todos los locales
  localTableGateway.loadAllVenues(function(err, locales) {
    // Obtenemos todas las ofertas (Activas de cada local)
    locales.forEach((local) => {
      pendingCallbacks++; 
      ofertas.loadOfertas(local.uuid, )
    }) 

    pendingCallbacks = ofertas.length;
    ofertas.forEach((oferta) => {
      localTableGateway.loadVenue(oferta.)
    });

    res.render('explorador_ofertas', { title: 'Explorador Ofertas', ofertas });
  });
});

module.exports = router;
