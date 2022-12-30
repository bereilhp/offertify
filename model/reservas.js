const uuid = require('uuid');

const Reserva = class Reserva {
    constructor(uuid, hora, dia, telefono) {
       this.uuid = uuid;
       this.hora = hora;
       this.dia = dia;
       this.telefono = telefono
    }
}

/**
 * 
 * @param {Time} hora 
 * @param {Date} dia 
 * @param {int} telefono 
 * @param {string | null} localId Opcional. UUID de la reserva. Si no se especifica, se genera uno nuevo
 * @returns 
 */

function reservaFactory(hora, dia, telefono, localId = null) {
    localId = localId ?? uuid.v4();
    return new Reserva(localId,hora, dia, telefono);
}

module.exports = {
    Reserva,
    reservaFactory
}