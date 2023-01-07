const express = require('express');
const router = express.Router();

const ChatTableGateway = require('../database/chatTableGateway');
const chatTableGateway = new ChatTableGateway();

const ReservaTableGateway = require('../database/reservaTableGateway');
const reservaTableGateway = new ReservaTableGateway();

const OfertaTableGateway = require('../database/ofertaTableGateway');
const ofertaTableGateway = new OfertaTableGateway();

const { chatFactory } = require('../model/chats');

let openChats = new Set();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Extraemos el Id de la reserva
  const idReserva = req.session.idReserva;

  // Verificamos si existe un chat asociado a la reserva
  chatTableGateway.existsChat(idReserva, function(err, exists) {
    if(err) {
      req.session.error = 'Error 500: Internal Server Error';
      res.redirect('/chat');
    }
    // Si existe el chat
    if (exists) {
      // Cargamos el chat
      chatTableGateway.loadChat(idReserva, function(err, chat) {
        if(err) {
          req.session.error = 'Error 500: Internal Server Error';
          res.redirect('/chat');
        }
        // Registramos el chat si no está ya registrado
        let found = false;
        openChats.forEach((savedChat) => {
          if (savedChat.uuid === chat.uuid) {
            found = true;
          }
        })
        
        if (!found) openChats.add(chat);

        // Se crea una página para el chat seleccionado
        res.render('chat', { title: `Chat: ${chat.uuid}`, chat, chatForScript: JSON.stringify(chat) });
      });
    } else {
      // Si el chat no existe, se crea
      chatFactory(function(chat) {
        // Obtenemos el id del usuario asociado a la reserva
        reservaTableGateway.getIdUsuario(idReserva, function(err, idUsuario) {
          if(err) {
            req.session.error = 'Error 500: Internal Server Error';
            res.redirect('/chat');
          }
          // Obtenemos el id de la oferta asocidada a la reserva
          reservaTableGateway.getIdOferta(idReserva, function(err, idOferta) {
            if(err) {
              req.session.error = 'Error 500: Internal Server Error';
              res.redirect('/chat');
            }
            // Obtenemos el id del Owner asociado a la oferta
            ofertaTableGateway.getIdOwner(idOferta, function(err, idOwner) {
              if(err) {
                req.session.error = 'Error 500: Internal Server Error';
                res.redirect('/chat');
              }
              // Insertamos el chat en la base de datos
              chatTableGateway.insertChat(chat.uuid, idOwner, idUsuario, idReserva, function(err) {
                if(err) {
                  req.session.error = 'Error 500: Internal Server Error';
                  res.redirect('/chat');
                }
                // Registramos el chat
                openChats.add(chat);

                // Cargamos la página
                res.render('chat', { title: `Chat: ${chat.uuid}`, chat, chatForScript: JSON.stringify(chat) });
              });
            });
          });
        });
      });
    }
  });
});

module.exports = { chatRouter: router, openChats };