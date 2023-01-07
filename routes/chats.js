const express = require('express');
const router = express.Router();

const ChatTableGateway = require('../database/chatTableGateway');
const chatTableGateway = new ChatTableGateway();


/* GET home page. */
router.get('/', function(req, res, next) {
  // Cargamos la lista de chats en los que participa el dueño
  
  res.render('chats', { title: 'Chats' });
});

module.exports = router;