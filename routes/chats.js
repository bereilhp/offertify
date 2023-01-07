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
    // Para cada Id, cargamos el id de la reserva asociada
    idList.forEach((id) => {
      pendingCallbacks++;
      chatTableGateway.getIdReserva(id, function(err, idReserva) {
        // Cargamos la reserva asociada al id
        pendingCallbacks++;
        reservaTableGateway.loadReserva(idReserva, function(err, reserva) {
          let chat = {};
          chat.reserva.descripcion;

          // Cargamos el nombre del usuario asociado a la reserva
          pendingCallbacks++;
          reservaTableGateway.getIdUsuario(idReserva, function(err, idUsuario) {
            pendingCallbacks++;
            userTableGateway
            

            pendingCallbacks--;
          });

          pendingCallbacks--;
        });

        pendingCallbacks--;
      }); 
    });
    
    pendingCallbacks--;
  });
  
  res.render('chats', { title: 'Chats' });
});

module.exports = router;