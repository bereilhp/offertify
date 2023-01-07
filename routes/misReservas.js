const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const ReservaTableGateway = require('../database/reservaTableGateway');
const reservaTableGateway = new ReservaTableGateway();

const LocalTableGateway = require('../database/localTableGateway');
const localTableGateway = new LocalTableGateway();

const UserTableGateway = require('../database/userTableGateway');
const userTableGateway = new UserTableGateway();

const ChatTableGateway = require('../database/chatTableGateway');
const chatTableGateway = new ChatTableGateway();

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
    res.render('misReservas', { title: 'Mis Reservas', reservas: reservasCargadas })
  }
}

/* POST /Reservas/cancelar: Cancela una reserva */
router.post('/cancelar', function(req, res, next) {
  // Obtenemos el Id de la reserva
  const idReserva = req.body.reserva; 

  // Obtenemos el usuario y cancelamos la reserva
  userTableGateway.loadUser(req.session.user.name, function(err, user) {
    user.cancelarReserva(idReserva, function(err) {
      req.session.user = user;
      res.redirect('/Reservas');
    });
  });  
});

/* POST /Reservas/Chat: Carga el chat asociado a la reserva */
router.post('/chat', function(req, res, next) {
  // Obtenemos el Id de la reserva
  const idReserva = req.body.reserva; 
  
  // Cargamos el chat adecuado
  req.session.idReserva = idReserva;
  res.redirect('/chat');
});

module.exports = router;