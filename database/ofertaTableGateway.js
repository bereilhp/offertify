const { ofertaFactory } = require("../model/ofertas");
const TableGateway = require("./tableGateway");

const OfertaTableGateway = class OfertaTableGateway extends TableGateway {

    /**
     * Función que inserta una oferta en la base de datos.
     * 
     * @param {string} ofertaId Id de la oferta
     * @param {float} precio Precio de la oferta
     * @param {string} descripcion Descripción de la oferta
     * @param {string} foto URL de la imagen asociada a la oferta
     * @param {int} activa `1` si la oferta está activa, `0` si no
     * @param {string} ownerId Id del dueño creador de la oferta
     * @param {string} localId Id del local asociado a la oferta
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve `null` o el error
     * producido.
     */
    insertOferta(ofertaId, precio, descripcion, foto, activa, ownerId, localId, callback) {
        const statement = `INSERT INTO Ofertas (UUID, Precio, Descripcion, Foto, Activa, OwnerId, LocalId) VALUES ('${ofertaId}', ${precio}, '${descripcion}', '${foto}', ${activa}, '${ownerId}', '${localId}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga todas las ofertas asociadas a un local.
     *  
     * @param {string} ownerId Id del dueño al que pertenece la oferta
     * @param {function(any | null, array<Oferta>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de ofertas y err será null.
     */
    loadOfertas(ownerId, callback) {
        const statement = `SELECT UUID, Precio, Descripcion, Foto, Activa FROM Ofertas WHERE OwnerId = '${ownerId}';`;
        const factory = function(row) {
            return ofertaFactory(row.Foto, row.Precio, row.Activa, row.Descripcion, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que borra una oferta de la base de datos.
     * 
     * @param {string} idOferta Id de la oferta a borrar.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    deleteOferta(idOferta, callback) {
        const statement = `DELETE FROM Ofertas WHERE UUID = '${idOferta}';`;
        this.run(statement, callback);
    }

    /**
     * Función que actualiza una oferta de la base de datos.
     * 
     * @param {string} ofertaId Id de la oferta
     * @param {float} precio Nuevo precio de la oferta
     * @param {string} descripcion Nueva descripción de la oferta
     * @param {string} foto Nueva URL de la imagen asociada a la oferta
     * @param {int} activa Nuevo valor para el parámetro 'activa'. Debe ser `0` (para desactivar la oferta) o `1` para 
     * activarla.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la actualización. Devuelve `null` o el error
     * producido.
     */
    updateOferta(ofertaId, precio, descripcion, foto, activa, callback) {
        const statement = `UPDATE Ofertas SET Precio=${precio}, Descripcion='${descripcion}', Foto='${foto}', Activa=${activa} WHERE UUID='${ofertaId}';`;
        this.run(statement, callback);
    } 
}

module.exports = OfertaTableGateway;