const uuid = require('uuid');

const Mensaje = class Mensaje {
    constructor(uuid, nombreUsuario, texto, timestamp) {
       this.uuid = uuid;
       this.nombreUsuario = nombreUsuario;
       this.texto = texto;
       this.timestamp = timestamp; 
    }
}

/**
 * Función para crear locales.
 *  
 * @param {string} nombreUsuario Nombre del Usuario
 * @param {string} texto Contenido del mensaje
 * @param {int} timestamp tiempo
 * @param {string | null} mensajeId Opcional. UUID del mensaje. Si no se especifica, se genera uno nuevo
 * @returns Un objeto mensaje con los datos proporcionados
 */
function mensajeFactory(nombreUsuario, texto,timestamp, mensajeId = null) {
    mensajeId = mensajeId ?? uuid.v4();
    return new Mensaje(mensajeId, nombreUsuario, texto, timestamp);
}

module.exports = {
    Mensaje,
    mensajeFactory
}