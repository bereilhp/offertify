const express = require('express');
const router = express.Router();

const UserTableGateway = require('../database/userTableGateway');
const userTableGateway = new UserTableGateway();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Cargamos todos los locales del usuario
  const locales = req.session.user.locales;
  res.render('editarSitio', { title: 'editarSitio', locales, localesParaScript:  JSON.stringify(locales) });
});

/* POST a /editarSitio/annadir: Añade un sitio */
router.post('/annadir', function(req, res, next) {
  // Recuperamos los datos recibidos
  const nombre = req.body.local;
  const calle = req.body.calle;
  const codigoPostal = req.body.codigoPostal;
  const logo = req.body.logo; 

  // Obtenemos el usuario y registramos el local
  userTableGateway.loadUser(req.session.user.name, function(err, owner) {
    if(err) {
      req.session.error = 'Error 500: Internal Server Error';
    }
    owner.crearLocal(nombre, calle, codigoPostal, logo, function(err) {
      // Al crearse el local, redirigmos a /editarSitio
      if (err) {
        req.session.error = 'Error 500: Internal Server Error';
      }
      req.session.user = owner;
      res.redirect('/editarSitio');
    });
  }); 
});

/* POST a /editarSitio/editar: Edita un sitio */
router.post('/editar', function(req, res, next) {
  // Recuperamos los datos recibidos
  const idLocal = req.body.idLocal;
  const nombre = req.body.local;
  const calle = req.body.calle;
  const codigoPostal = req.body.codigoPostal;
  const logo = req.body.logo; 

  // Obtenemos el usuario y editamos el local
  userTableGateway.loadUser(req.session.user.name, function(err, owner) {
    if(err) {
      req.session.error = 'Error 500: Internal Server Error';
      res.redirect('/editarSitio');
    }
    owner.editarLocal(idLocal, nombre, calle, codigoPostal, logo, function(err) {
      if(err) {
        req.session.error = 'Error 500: Internal Server Error';
      }
      // Al crearse el local, redirigmos a /editarSitio
      req.session.user = owner;
      res.redirect('/editarSitio');
    });
  }); 
});

module.exports = router;