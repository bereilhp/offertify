const path = require('path');
const { ofertaFactory } = require("../model/ofertas");
const TableGateway = require("./tableGateway");

let DB_PATH = path.join(__dirname, 'database.db');

const OfertaTableGateway = class OfertaTableGateway extends TableGateway {
    constructor() {
        super(DB_PATH);
    }

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
     * Función que carga todas las ofertas asociadas a un dueño.
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

    /**
     * Función que carga todas las ofertas activas de la Base de Datos.
     *  
     * @param {function(any | null, array<Oferta>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de ofertas y err será null.
     */
    loadAllActiveOfertas(callback) {
        const statement = `SELECT UUID, Precio, Descripcion, Foto, Activa FROM Ofertas WHERE Activa = 1;`;
        const factory = function(row) {
            return ofertaFactory(row.Foto, row.Precio, row.Activa, row.Descripcion, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que carga todas las ofertas asociadas a un local.
     *  
     * @param {string} localId Id del local al que pertenece la oferta
     * @param {function(any | null, array<Oferta>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de ofertas y err será null.
     */
    loadOfertasLocal(localId, callback) {
        const statement = `SELECT UUID, Precio, Descripcion, Foto, Activa FROM Ofertas WHERE LocalId = '${localId}';`;
        const factory = function(row) {
            return ofertaFactory(row.Foto, row.Precio, row.Activa, row.Descripcion, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que recupera una oferta a partir de su UUID 
     *  
     * @param {string} ofertaId Id de la oferta
     * @param {function(any | null, Oferta | null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una oferta y err será null.
     */
    loadOferta(ofertaId, callback) {
        const statement = `SELECT UUID, Precio, Descripcion, Foto, Activa FROM Ofertas WHERE UUID = '${ofertaId}';`;
        const factory = function(row) {
            return ofertaFactory(row.Foto, row.Precio, row.Activa, row.Descripcion, row.UUID);
        }
        this.get(statement, factory, callback);
    }
    
    /**
     * Función que recupera el Id del local asociado a una oferta
     *  
     * @param {string} ofertaId Id de la oferta
     * @param {function(any | null, string | null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve el id del local y err será null.
     */
    getIdLocal(ofertaId, callback) {
        const statement = `SELECT LocalId FROM Ofertas WHERE UUID = '${ofertaId}';`;
        const factory = function(row) {
            return row.LocalId;
        }
        this.get(statement, factory, callback);
    }
    
    /**
     * Función que recupera el Id del dueño asociado a una oferta
     *  
     * @param {string} ofertaId Id de la oferta
     * @param {function(any | null, string | null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve el id del dueño y err será null.
     */
    getIdOwner(ofertaId, callback) {
        const statement = `SELECT OwnerId FROM Ofertas WHERE UUID = '${ofertaId}';`;
        const factory = function(row) {
            return row.OwnerId;
        }
        this.get(statement, factory, callback);
    }
}

module.exports = OfertaTableGateway;