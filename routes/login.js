const UserTableGateway = require('../database/userTableGateway');
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
  email = req.body.email; 
  password = req.body.password;

  userTableGateway.userExists(email, function(err, existe) {
    if (!existe) {
      req.session.error = 'Usuario y/o constraseña incorrecto';
      res.redirect('/login');
      console.log("userExists")
    } else {
      userTableGateway.loadUser(email, function(err, user) {
        if (err) {
          console.log("loadUser")
          req.session.error = 'Usuario y/o constraseña incorrecto';
          res.redirect('/login');
        } else {
          console.log(password)
          bcrypt.compare(password, user.hash, function(err, iguales) {
            if (iguales) {
              console.log("Todo Correcto")
              req.session.user = user;
              switch(user.rol) {
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
    }
  });
});

module.exports = router;