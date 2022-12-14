const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const LocalTableGateway = require('../database/localTableGateway');
const localTableGateway = new LocalTableGateway();

const UserTableGateway = require('../database/userTableGateway');
const userTableGateway = new UserTableGateway();

let pendingCallbacks = 0;
let ofertasActivas = [];

/* GET -> Carga todas las ofertas y las muestra */
router.get('/', function(req, res, next) {
  // Vaciamos la lista de ofertas activas y reseteamos el valor de pendingCallbacks
  ofertasActivas = [];
  pendingCallbacks = 0;

  // Cargamos todos los locales
  localTableGateway.loadAllVenues(function(err, locales) {
    if(err) {
      req.session.error = 'Error 500: Internal Server Error';
      res.redirect('/explorador_ofertas');
    }
    // Obtenemos todas las ofertas (Activas de cada local)
    locales.forEach((local) => {
      pendingCallbacks++; 
      ofertaTableGateway.loadOfertasLocal(local.uuid, function(err, ofertas) {
        if(err) {
          req.session.error = 'Error 500: Internal Server Error';
          res.redirect('/explorador_ofertas');
        }
        ofertas.forEach((oferta) => {
          if (oferta.activa) {
            oferta.local = local.nombre;
            ofertasActivas.push(oferta);
          }
        });

        pendingCallbacks--;
      });
    }) 

    // Esperamos a que finalice la carga de las ofertas
    waitForPendingCallbacks(req, res, next);
  });
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
    res.render('explorador_ofertas', { title: 'Explorador Ofertas', ofertas: ofertasActivas });
  }
}

/* POST -> Crea una reserva y redirige a MIS RESERVAS */
router.post('/', function(req, res, next) {
  // Obtenemos el ID de la oferta
  const ofertaId = req.body.oferta;
  const telefono = req.body.telefono;
  const dia = req.body.dia;
  const hora = req.body.hora;

  // Creamos una reserva
  userTableGateway.loadUser(req.session.user.name, function(err, user) {
    if(err) {
      req.session.error = 'Error 500: Internal Server Error';
      res.redirect('/explorador_ofertas');
    }
    user.hacerReserva(ofertaId, telefono, hora, dia, function(reserva) {
      req.session.user = user;
      res.redirect('/Reservas');
    });
  });
});

module.exports = router;
