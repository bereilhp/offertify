const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const LocalTableGateway = require('../database/localTableGateway');
const localTableGateway = new LocalTableGateway();

let ofertasActivas = [];
let pendingCallbacks = 0;

/* GET -> Carga todas las ofertas y las muestra */
router.get('/', function(req, res, next) {
  // Cargamos todos los locales
  localTableGateway.loadAllVenues(function(err, locales) {
    // Obtenemos todas las ofertas (Activas de cada local)
    locales.forEach((local) => {
      pendingCallbacks++; 
      ofertaTableGateway.loadOfertasLocal(local.uuid, function(err, ofertas) {
        ofertas.forEach((oferta) => {
          if (oferta.activa) {
            oferta.local = local.nombre;
            ofertasActivas.push(oferta);
          }
        });

        pendingCallbacks--;
      });

      pendingCallbacks--;
    }) 

    // Esperamos a que finalice la carga de las ofertas
    const p = new Promise((resolve, reject) => {
      while (pendingCallbacks > 0);
      resolve();
    }).then(res.render('explorador_ofertas', { title: 'Explorador Ofertas', ofertas: ofertasActivas }));
  });
});

/* POST -> Crea una reserva y redirige a MIS RESERVAS */
router.post('/', function(req, res, next) {
  // Obtenemos el ID de la oferta
  const ofertaId = req.body.oferta;

  // Creamos una reserva
  //req.session.user.hacer
});

module.exports = router;
