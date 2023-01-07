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
    if(err) {
      req.session.error = 'Error 500: Internal Server Error';
      res.redirect('/historico');
    }
    ofertas.forEach((oferta) => {
      pendingCallbacks++;
      ofertaTableGateway.getIdLocal(oferta.uuid, function(err, idLocal) {
        if(err) {
          req.session.error = 'Error 500: Internal Server Error';
          res.redirect('/historico');
        }
        pendingCallbacks++;
        localTableGateway.loadVenue(idLocal, function(err, local) {
        if(err) {
          req.session.error = 'Error 500: Internal Server Error';
          res.redirect('/historico');
        }
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

/* POST /reactivar: reactiva una oferta */
router.post('/reactivar', function(req, res, next) {
  const idOferta = req.body.oferta;
  console.log(idOferta)
  
  // Reactivamos la oferta y redirigimos a ofertasActivas
  userTableGateway.loadUser(req.session.user.name, function(err, owner) {
    if(err) {
      req.session.error = 'Error 500: Internal Server Error';
      res.redirect('/historico');
    }
    owner.activarOferta(idOferta, function(err) {
      if(err) {
        req.session.error = 'Error 500: Internal Server Error';
        res.redirect('/historico');
      }
      req.session.user = owner;
      res.redirect('/ofertasActivas');
    });
  });
});

module.exports = router;