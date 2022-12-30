const Chat = class Chat {
    constructor(uuid,mensajes = []) {
        this.uuid = uuid;
        this.mensajes = mensajes
    }

    escribirMensaje(texto, nombreUsuario) {
        // TO DO
    }
};

function chatFactory(localId = null) {
    localId = localId ?? uuid.v4();
    return new Chat(localId, /*mensajes*/);
}


module.exports = {
    Chat,
    chatFactory
}