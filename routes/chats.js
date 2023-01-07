const express = require('express');
const router = express.Router();

const ChatTableGateway = require('../database/chatTableGateway');
const chatTableGateway = new ChatTableGateway();

const ReservaTableGateway = require('../database/reservaTableGateway');
const reservaTableGateway = new ReservaTableGateway();

const UserTableGateway = require('../database/userTableGateway');
const userTableGateway = new UserTableGateway();

let pendingCallbacks = 0;
let ownerChats = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  // Reseteamos los valores de las variables globales
  pendingCallbacks = 0; 
  ownerChats = [];

  // Cargamos la lista de chats en los que participa el dueño
  pendingCallbacks++;
  chatTableGateway.loadChatIds(req.session.user.uuid, function(err, idList) {
    if(err) {
      req.session.error = err;
      res.redirect('/chats');
    }
    // Para cada Id, cargamos el id de la reserva asociada
    idList.forEach((id) => {
      pendingCallbacks++;
      chatTableGateway.getIdReserva(id, function(err, idReserva) {
        if(err) {
          req.session.error = 'Error 500: Internal Server Error';
          res.redirect('/chats');
        }
        // Cargamos la reserva asociada al id
        pendingCallbacks++;
        reservaTableGateway.loadReserva(idReserva, function(err, reserva) {
          if(err) {
            req.session.error = 'Error 500: Internal Server Error';
            res.redirect('/chats');
          }
          let chat = {};
          chat.reserva = reserva.uuid;
          
          // Cargamos el nombre del usuario asociado a la reserva
          pendingCallbacks++;
          reservaTableGateway.getIdUsuario(idReserva, function(err, idUsuario) {
            if(err) {
              req.session.error = 'Error 500: Internal Server Error';
              res.redirect('/chats');
            }
            pendingCallbacks++;
            userTableGateway.loadUserFromId(idUsuario, function(err, user) {
              if(err) {
                req.session.error = 'Error 500: Internal Server Error';
                res.redirect('/chats');
              }
              // Guardamos el nombre del usuario
              chat.usuario = user.name;

              // Añadimos el chat a la lista
              ownerChats.push(chat);

              pendingCallbacks--;
            });

            pendingCallbacks--;
          });

          pendingCallbacks--;
        });

        pendingCallbacks--;
      }); 
    });
    
    pendingCallbacks--;
  });

  // Esperamos a que finalicen los callbacks
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
    console.log(ownerChats)
    res.render('chats', { title: 'Chats', chats: ownerChats });
  }
}

/* POST: Carga el chat asociado a la reserva */
router.post('/', function(req, res, next) {
  // Obtenemos el Id de la reserva
  const idReserva = req.body.idReserva; 
  
  // Cargamos el chat adecuado
  req.session.idReserva = idReserva;
  res.redirect('/chat');
});

module.exports = router;