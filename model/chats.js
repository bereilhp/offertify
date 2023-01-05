const uuid = require('uuid');

const Chat = class Chat {
    constructor(uuid,mensajes = []) {
        this.uuid = uuid;
        this.mensajes = mensajes
    }

    escribirMensaje(texto, nombreUsuario) {

    }
};

/**
 * 
 * @param {string} mensajes 
 * @param {string | null} chatId Opcional. UUID del chat. Si no se especifica, se genera uno nuevo
 * @returns 
 */
function chatFactory(mensajes, chatId = null) {
    chatId = chatId ?? uuid.v4();
    return new Chat(chatId, mensajes);
}


module.exports = {
    Chat,
    chatFactory
}