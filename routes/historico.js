const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const LocalTableGateway = require('../database/localTableGateway');
const localTableGateway = new LocalTableGateway();

const UserTableGateway = require('../database/userTableGateway');
const userTableGateway = new UserTableGateway();

let historicoOfertas = [];
let pendingCallbacks = 0;

/* GET -> Carga todas las Ofertas */
router.get('/', function(req, res, next) {
  
  historicoOfertas = [];
  pendingCallbacks = 0;

  pendingCallbacks++;
  ofertaTableGateway.loadOfertas(req.session.user.uuid, function(err, ofertas) {
    ofertas.forEach((oferta) => {
      pendingCallbacks++;
      ofertaTableGateway.getIdLocal(oferta.uuid, function(err, idLocal) {
        pendingCallbacks++;
        localTableGateway.loadVenue(idLocal, function(err, local) {
          oferta.local = local;
          historicoOfertas.push(oferta);

          pendingCallbacks--;
        });    

        pendingCallbacks--;
      });
    })

    pendingCallbacks--;
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
    res.render('historico', { title:'Histórico de Ofertas', ofertas: historicoOfertas, ofertasForScript: JSON.stringify(historicoOfertas) });
  }
}

/* POST /ofertasActivas/editar: edita una oferta y recarga la página */
router.post('/editar', function(req, res, next) {
  const descripcion = req.body.descripcion;
  const precio = req.body.precio;
  const imagen = req.body.imagen;
  const idOferta = req.body.oferta;
  
  // Editamos la oferta y redirigimos a ofertasActivas
  userTableGateway.loadUser(req.session.user.name, function(err, owner) {
    owner.editarOferta(idOferta, imagen, precio, descripcion, function(err) {
      req.session.user = owner;
      res.redirect('/ofertasActivas');
    });
  });
});

/* POST /ofertasActivas/desactivar: desactiva una oferta y recarga la página */
router.post('/desactivar', function(req, res, next) {
  const idOferta = req.body.oferta;
  
  // Editamos la oferta y redirigimos a ofertasActivas
  userTableGateway.loadUser(req.session.user.name, function(err, owner) {
    owner.desactivarOferta(idOferta, function(err) {
      req.session.user = owner;
      res.redirect('/ofertasActivas');
    });
  });
});

module.exports = router;