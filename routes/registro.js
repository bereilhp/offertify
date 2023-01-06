const usuarios = require('../model/usuarios');
const express = require('express');
//const { UserTableGateway } = require('../database/database');
//const userTableGateway = new UserTableGateway();

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('registro', { title: "Registro" });
});

/* POST Registra al usuario */
router.post('/', function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const repeatPassword = req.body.repeatPassword;
  const rol = req.body.rol;

  // Comprobamos que los datos cumplen las restricciones
  if (validateInput(email, password, repeatPassword)) {
    // Comprobamos si existe el usuario
    usuarios.userExists(email, function(err, existe) {
      if (existe) {
        req.session.error = 'Error: El usuario ya existe';
        res.redirect('/registro');
      } else {
        // Registramos al usuario
        usuarios.registerUser(email, password, rol, function(err, user) {
          if (err) {
            req.session.error = 'Error al registrar al usuario';
            res.redirect('/registro');
          } else {
            req.session.user = user;
            if (user.rol === 'owner') {
              res.redirect('/ofertasActivas');
            } else {
              res.redirect('/explorador_ofertas');
            }
          }
        });
      }
    });  
  } else {
    req.session.error = 'Datos recibidos no válidos';
    res.redirect('/registro');
  }
});


/* Función para validar la entrada */
function validateInput(email, firstPassword, secondPassword) {
  let valid = true;

  // Regex para correo según RFC2822:
  //  -> empieza por al menos 1 caracter alfanumérico o uno de los siguientes: ! # $ % & ' * + / = ? ^ _ ` { | } ~ -
  //  -> Encuentra un punto. Repite la condición anterior (Esta línea puede ocurrir 0 o muchas veces)
  //  -> Continúa con @
  //  -> Reglas para dominio: comienza por alfanumérico, continúa con alfanumérico o « - » y acaba con alfanumérico (esta línea mínimo una vez)
  const rfc2822Regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  valid = rfc2822Regex.test(email);
  valid &&= (firstPassword === secondPassword);
  valid &&= (firstPassword.length >= 8);

  return valid;
}

module.exports = router;