const uuid = require('uuid');
let { MessageTableGateway } = require('../database/database');

const Chat = class Chat {
    constructor(uuid,mensajes = []) {
        this.uuid = uuid;
        this.mensajes = mensajes;
    }

    escribirMensaje(texto, nombreUsuario) {

    }
};

/**
 * 
 * @param {string | null} chatId Opcional. UUID del chat. Si no se especifica, se genera uno nuevo
 * @param {function(Chat | null)} callback Función a ejecutar una vez creado el chat. Toma como parámetro el chat creado:
 * (o `null` si ha habido un error)
 */
function chatFactory(callback, chatId = null) {
    chatId = chatId ?? uuid.v4();
    let chat = new Chat(chatId);
    
    const messageTableGateway = new MessageTableGateway();
    messageTableGateway.loadMessages(chat.uuid, function(err, mensajes) {
        if (err) {
            console.log(err);
            callback(null);
        } else {
            chat.mensajes = mensajes;
            callback(chat);
        }
    });
}


module.exports = {
    Chat,
    chatFactory
}