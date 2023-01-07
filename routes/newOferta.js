const express = require('express');
const router = express.Router();

const UserTableGateway = require('../database/userTableGateway');
const userTableGateway = new UserTableGateway();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('newOferta', { title: 'Añadir Oferta' });
});

/* POST: Creamos una oferta */
router.post('/', function(req, res, next) {
  const nombreLocal = req.body.local;
  const descripcion = req.body.descripcion;
  const precio = req.body.precio;
  const imagen = req.body.imagen;

  // Obtenemos el id del local a partir de su nombre
  let idLocal = null;
  req.session.user.locales.forEach((local) => {
    if (local.nombre === nombreLocal) {
      idLocal = local.uuid;
    }
  });

  // Creamos una oferta y redirigimos a ofertasActivas
  userTableGateway.loadUser(req.session.user.name, function(err, owner) {
    if (err) {
      req.session.error = 'Error 500: Internal Server Error';
      res.redirect('/NuevaOferta');
    }
    owner.hacerOferta(imagen, precio, descripcion, idLocal, function(err) {
      if (err) {
        req.session.error = 'Error 500: Internal Server Error';
        res.redirect('/NuevaOferta');
      }
      
      req.session.user = owner;
      res.redirect('/ofertasActivas');
    });
  });
});

module.exports = router;