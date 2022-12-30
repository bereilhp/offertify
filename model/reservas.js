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
 * @param {Time} hora Nos dice la hora exacta de la reserva
 * @param {Date} dia Nos dice la hora de la reserva
 * @param {int} telefono Nos dice el teleno que esta relacionado con la reserva 
 * @param {string | null} localId Opcional. UUID de la reserva. Si no se especifica, se genera uno nuevo
 * @returns Objeto reserva con los datos proporcionados
 */

function reservaFactory(hora, dia, telefono, localId = null) {
    localId = localId ?? uuid.v4();
    return new Reserva(localId,hora, dia, telefono);
}

module.exports = {
    Reserva,
    reservaFactory
}