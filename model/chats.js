const uuid = require('uuid');

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
    mensajes = [];
    let chat = new Chat(chatId, mensajes);
    callback(chat);
}


module.exports = {
    Chat,
    chatFactory
}