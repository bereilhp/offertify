const path = require('path');
const { localFactory } = require('../model/locales');
const TableGateway = require('./tableGateway');

let DB_PATH = path.join(__dirname, 'database.db');

const LocalTableGateway = class LocalTableGateway extends TableGateway {
    constructor() {
        super(DB_PATH);
    }
    /**
     * Función que inserta un local en la base de datos
     * 
     * @param {string} venueUUID
     * @param {string} name 
     * @param {string} calle
     * @param {int} codigoPostal
     * @param {string} ownerUUID
     * @param {function} callback Callback ejecutado al finalizar la inserción. Devuelve el local insertado
     */
    insertVenue(uuid, name, calle, codigoPostal, logo, ownerUUID, callback) {
        const statement = `INSERT INTO Locales (UUID, Nombre, Calle, CodigoPostal, Logo, OwnerId) VALUES ('${uuid}', '${name}', '${calle}', ${codigoPostal}, '${logo}', '${ownerUUID}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga todos los locales asociados al dueño indicado.
     *  
     * @param {string} ownerId Id del dueño del local
     * @param {function(any | null, array<Local> | null)} callback Callback ejecutado al cargar los locales. Si todo va bien, devuelve 
     * una lista de locales y err será null.
     */
    loadVenues(ownerId, callback) {
        const statement = `SELECT UUID, Nombre, Calle, CodigoPostal, Logo FROM Locales WHERE OwnerId = '${ownerId}';`;
        const factory = function(row) {
            return localFactory(row.Nombre, row.Calle, row.CodigoPostal, row.Logo, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que actualiza un local en la base de datos
     * 
     * @param {string} venueUUID Id del local
     * @param {string} name Nuevo nombre del local
     * @param {string} calle Nueva calle del local
     * @param {int} codigoPostal Nuevo Código postal
     * @param {function(any | null)} callback Callback ejecutado al finalizar la actualización. Devuelve `null` si todo va bien,
     * un error en caso contrario 
     */
    updateVenue(uuid, name, calle, codigoPostal, logo, callback) {
        const statement = `UPDATE Locales SET Nombre='${name}', Calle='${calle}', CodigoPostal=${codigoPostal}, Logo='${logo}' WHERE UUID='${uuid}';`;
        this.run(statement, callback);
    } 

    /**
     * Función que borra un local de la base de datos
     * 
     * @param {string} venueUUID Id del local
     * @param {function(any | null)} callback Callback ejecutado al finalizar el borrado. Devuelve `null` si todo va bien,
     * un error en caso contrario 
     */
    deleteVenue(uuid, callback) {
        const statement = `DELETE FROM Locales WHERE UUID = '${uuid}';`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga el local especificado.
     *  
     * @param {string} venueId Id del local
     * @param {function(any | null, Local | null)} callback Callback ejecutado al cargar el local. Si todo va bien, devuelve 
     * una lista de locales y err será null.
     */
    loadVenue(venueId, callback) {
        const statement = `SELECT UUID, Nombre, Calle, CodigoPostal, Logo FROM Locales WHERE UUID = '${venueId}';`;
        const factory = function(row) {
            return localFactory(row.Nombre, row.Calle, row.CodigoPostal, row.Logo, row.UUID);
        }
        this.get(statement, factory, callback);
    }
}

module.exports = LocalTableGateway;