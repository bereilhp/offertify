const { resennaFactory } = require("../model/resennas");
const TableGateway = require("./tableGateway");

const ResennaTableGateway = class ResennaTableGateway extends TableGateway {

    /**
     * Método qu inserta una reseña en la Base de Datos.
     * 
     * @param {string} idResenna Id de la Reseña a insertar.
     * @param {string} descripcion Descripción dejada por el usuario.
     * @param {string} userId Id del usuario que realiza la reseña.
     * @param {string} ofertaId Id de la oferta asociada a la reseña.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve `null` o el error
     */
    insertResenna(idResenna, descripcion, userId, ofertaId, callback) {
        const statement = `INSERT INTO Resennas (UUID, descripcion, UserId, OfertaId) VALUES ('${idResenna}', '${descripcion}', '${userId}', '${ofertaId}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga todas las reseñas asociadas a una oferta.
     *  
     * @param {string} ofertaId Id de la oferta a la que pertenece la reseña
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de reseñas y err será null.
     */
    loadResennas(ofertaId, callback) {
        const statement = `SELECT UUID, Descripcion FROM Resennas WHERE OfertaId = '${ofertaId}';`;
        const factory = function(row) {
            return resennaFactory(row.Descripcion, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que borra una reseña de la base de datos.
     * 
     * @param {string} idResenna Id de la reseña a borrar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    deleteResenna(idResenna, callback) {
        const statement = `DELETE FROM Resennas WHERE UUID = '${idResenna}';`;
        this.run(statement, callback);
    } 
}

module.exports = ResennaTableGateway;