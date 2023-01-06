const uuid = require('uuid');
let { MessageTableGateway } = require('../database/database');
const { mensajeFactory } = require('./mensajes');

const Chat = class Chat {
    constructor(uuid,mensajes = []) {
        this.uuid = uuid;
        this.mensajes = mensajes;
    }

    escribirMensaje(texto, idUsuario, callback) {
        const msg = mensajeFactory(idUsuario, texto, null);
        const messageTableGateway = new MessageTableGateway();
        const chat = this;
        messageTableGateway.insertMessage(msg.uuid, msg.texto, msg.nombreUsuario, this.uuid, function(err) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                chat.mensajes.push(msg);
                callback(null);
            }
        });
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