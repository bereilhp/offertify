const { UserTableGateway } = require('../database/database');
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const userTableGateway = new UserTableGateway();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', { title: "Login" });
});

/* POST -> Comprueba si existe el usuario y lo redirige a la página adecuada */
router.post('/', function(req, res, next) {
  email = JSON.stringify(req.body.email); 
  password = req.body.password;

  userTableGateway.loadUser(email, function(err, user) {
    if (err) {
      req.session.error = 'Usuario y/o constraseña incorrecto';
      res.redirect('/login');
    } else {
      bcrypt.compare(password, user.password, function(err, iguales) {
        if (iguales) {
          req.session.user = user;
          switch(rol) {
            case 'user':
              res.redirect('/explorador_ofertas');
              break;
            case 'owner':
              res.redirect('/ofertasActivas');
              break;
            case 'admin':
              res.redirect('/interfaz_admin');
              break;
          }
        } else {
          req.session.error = 'Usuario y/o constraseña incorrecto';
          res.redirect('/login');
        }
      });
    }
  }); 
});

module.exports = router;