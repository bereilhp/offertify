const express = require('express');
const router = express.Router();

const ChatTableGateway = require('../database/chatTableGateway');
const chatTableGateway = new ChatTableGateway();

const ReservaTableGateway = require('../database/reservaTableGateway');
const reservaTableGateway = new ReservaTableGateway();

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

        pendingCallbacks--;
      }); 
    });
    
    pendingCallbacks--;
  });
  
  res.render('chats', { title: 'Chats' });
});

module.exports = router;