const express = require('express');
const router = express.Router();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

/* GET -> Carga las Ofertas Activas */
router.get('/', function(req, res, next) {
  ofertaTableGateway.loadOfertas(req.session.user.uuid, function(err, ofertas) {
    let ofertasActivas = [];
    ofertas.forEach((oferta) => {
      if (oferta.activa) {
        ofertasActivas.push(oferta);
      }
    })
    res.render('ofertasActivas', { title:'Ofertas Activas', ofertas: ofertasActivas });
  });
});

module.exports = router;