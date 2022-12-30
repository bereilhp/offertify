const uuid = require('uuid');

const Mensaje = class Mensaje {
    constructor(uuid, nombreU, texto, timestamp) {
       this.uuid = uuid;
       this.nombreU = nombreU;
       this.texto = texto;
       this.timestamp = timestamp; 
    }
}

/**
 * Función para crear locales.
 *  
 * @param {string} nombreU Nombre del Usuario
 * @param {string} texto Contenido del mensaje
 * @param {int} timestamp tiempo
 * @param {string | null} mensajeId Opcional. UUID del mensaje. Si no se especifica, se genera uno nuevo
 * @returns Un objeto mensaje con los datos proporcionados
 */
function mensajeFactory(nombreU, texto,timestamp, mensajeId = null) {
    mensajeId = mensajelId ?? uuid.v4();
    return new Mensaje(mensajeId, nombreU, texto, timestamp);
}

module.exports = {
    Mensaje,
    mensajeFactory
}