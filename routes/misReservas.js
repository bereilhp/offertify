const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const ReservaTableGateway = require('../database/reservaTableGateway');
const reservaTableGateway = new ReservaTableGateway();

let pendingCallbacks = 0;
let reservasCargadas = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  pendingCallbacks = 0;
  reservasCargadas = [];

  const reservas = req.session.user.reservas;

  // Cargamos la oferta asociada a cada reserva
  reservas.forEach((reserva) => {
    reservaTableGateway.getIdOferta(reserva.uuid, function(err, idOferta) {

    }); 
  });
  res.render('misReservas', { title: 'Mis Reservas', reservas });
});

module.exports = router;