const path = require('path');
const { reservaFactory } = require("../model/reservas");
const TableGateway = require("./tableGateway");

let DB_PATH = path.join(__dirname, 'database.db');

const ReservaTableGateway = class ReservaTableGateway extends TableGateway {
    constructor() {
        super(DB_PATH);
    }

    /**
     * Función que inserta una reserva en la Base de Datos.
     * 
     * @param {string} idReserva Id de la reserva a insertar.
     * @param {int} telefono Teléfono del usuario que realiza la reseña.
     * @param {string} hora String conteniendo la hora.
     * @param {string} dia String con la fecha de la reserva.
     * @param {string} userId Id del usuario que realiza la reserva.
     * @param {string} idOferta Id de la oferta asociada a la reserva.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve `null` o el error
     * producido.
     */
    insertReserva(idReserva, telefono, hora, dia, userId, idOferta, callback) {
        const statement = `INSERT INTO Reservas (UUID, Telefono, Hora, Dia, UserId, OfertaId) VALUES ('${idReserva}', '${telefono}', '${hora}', '${dia}', '${userId}', '${idOferta}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga todas las reservas asociadas a un usuario.
     *  
     * @param {string} userId Id del usuario al que pertenece la reserva
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de reservas y err será null.
     */
    loadReservas(userId, callback) {
        const statement = `SELECT UUID, Telefono, Hora, Dia, OfertaId FROM Reservas WHERE UserId = '${userId}';`;
        const factory = function(row) {
            return reservaFactory(row.Hora, row.Dia, row.Telefono, row.OfertaId, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que recupera una reserva en función de su id.
     *  
     * @param {string} reservaId Id del usuario al que pertenece la reserva
     * @param {function(any | null, Reserva| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una reserva y err será null.
     */
    loadReserva(reservaId, callback) {
        const statement = `SELECT UserId, Telefono, Hora, Dia, OfertaId FROM Reservas WHERE UUID = '${reservaId}';`;
        const factory = function(row) {
            return reservaFactory(row.Hora, row.Dia, row.Telefono, row.OfertaId, reservaId);
        }
        this.get(statement, factory, callback);
    }

    /**
     * Función que recupera el Id de la oferta asociada a la reserva.
     *  
     * @param {string} idReserva Id de la oferta.
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve un string y err será null.
     */
    getIdOferta(idReserva, callback) {
        const statement = `SELECT OfertaId FROM Reservas WHERE UUID = '${idReserva}';`;
        const factory = function(row) {
            return row.OfertaId;
        }
        this.get(statement, factory, callback);
    }

    /**
     * Función que recupera el Id del usuario creador de la reserva.
     *  
     * @param {string} idReserva Id de la reserva.
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve un string y err será null.
     */
    getIdUsuario(idReserva, callback) {
        const statement = `SELECT UserId FROM Reservas WHERE UUID = '${idReserva}';`;
        const factory = function(row) {
            return row.UserId;
        }
        this.get(statement, factory, callback);
    }

    /**
     * Función que borra una reserva de la base de datos.
     * 
     * @param {string} idReserva Id de la reserva a borrar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    deleteReserva(idReserva, callback) {
        const statement = `DELETE FROM Reservas WHERE UUID = '${idReserva}';`;
        this.run(statement, callback);
    } 
}

module.exports = ReservaTableGateway;