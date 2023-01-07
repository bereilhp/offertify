const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const ReservaTableGateway = require('../database/reservaTableGateway');
const reservaTableGateway = new ReservaTableGateway();

const LocalTableGateway = require('../database/localTableGateway');
const localTableGateway = new LocalTableGateway();

let pendingCallbacks = 0;
let reservasCargadas = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  pendingCallbacks = 0;
  reservasCargadas = [];

  const reservas = req.session.user.reservas;

  // Cargamos la oferta asociada a cada reserva
  reservas.forEach((reserva) => {
    pendingCallbacks++;
    reservaTableGateway.getIdOferta(reserva.uuid, function(err, idOferta) {
      pendingCallbacks++;
      ofertaTableGateway.loadOferta(idOferta, function(err, oferta) {
        reserva.oferta = oferta;
        
        // Cargamos el local asociado a la oferta
        pendingCallbacks++;
        ofertaTableGateway.getIdLocal(oferta.uuid, function(err, idLocal) {
          pendingCallbacks++;
          localTableGateway.loadVenue(idLocal, function(err, local) {
            reserva.oferta.local = local;
            reservasCargadas.push(reserva);

            pendingCallbacks--;
          });

          pendingCallbacks--;
        });

        pendingCallbacks--;
      });

      pendingCallbacks--;
    }); 
  });
  
  waitForPendingCallbacks(req, res, next);
});

// Función que carga la página al finalizar todos los callbacks
function waitForPendingCallbacks(req, res, next) {
  // Mientras haya callbacks pendientes, se espera
  if (pendingCallbacks > 0) {
    setTimeout(function() {
      waitForPendingCallbacks(req, res, next); 
      return;
    }, 0.1);
  } else {
    console.log(reservasCargadas)
    res.render('misReservas', { title: 'Mis Reservas', reservas: reservasCargadas })
  }
}

module.exports = router;