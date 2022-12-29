const sqlite3 = require('sqlite3');
const path = require('path');
const { userFactory } = require('../model/usuarios');
const { localFactory } = require('../model/locales');

const DB_PATH = path.join(__dirname, 'database.db');

let db = new sqlite3.Database(DB_PATH, () => {
    console.log("Conectado a BBDD");
});

const UserTableGateway = class UserTableGateway {
    /**
     * Función que inserta un usuario en la base de datos
     * 
     * @param {string} uuid
     * @param {string} name 
     * @param {string} hash 
     * @param {string} role 
     * @param {function} callback Callback ejecutado al finalizar la inserción. Devuelve el usuario insertado
     */
    insertUser(uuid, name, hash, role, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Usuarios (UUID, Nombre, Hash, Rol) VALUES ('${uuid}', '${name}', '${hash}', '${role}');`;
            db.serialize(() => {
                db.run('BEGIN TRANSACTION;');
                db.run(statement, function(err) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                });
                db.run('COMMIT;', function(err) {
                    callback(null);
                });
            });
        });
    } 

    /**
     * Función que carga un usuario de la base de datos.
     *  
     * @param {string} name Nombre del usuario
     * @param {function(err, user)} callback Callback ejecutado al cargar el usuario. Si todo va bien, devuelve 
     * un usuario y err será null.
     */
    loadUser(name, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID, Hash, Rol FROM Usuarios WHERE Nombre = '${name}'`;
            db.get(statement, function(err, row) {
                if (err) {
                    callback(err, null);
                } else {
                    let user = userFactory(name, row.Hash, row.Rol, row.UUID);
                    callback(null, user);
                }
            });
        });
    }
}

const LocalTableGateway = class LocalTableGateway {
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
    insertVenue(uuid, name, calle, codigoPostal, ownerUUID, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Locales (UUID, Nombre, Calle, CodigoPostal, OwnerId) VALUES ('${uuid}', '${name}', '${calle}', ${codigoPostal}, '${ownerUUID}');`;
            db.serialize(() => {
                db.run('BEGIN TRANSACTION;');
                db.run(statement, function(err) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                });
                db.run('COMMIT;', function(err) {
                    callback(null);
                });
            });
        });
    } 

    /**
     * Función que carga todos los locales asociados al dueño indicado.
     *  
     * @param {string} ownerId Id del dueño del local
     * @param {function(err, user)} callback Callback ejecutado al cargar los locales. Si todo va bien, devuelve 
     * una lista de locales y err será null.
     */
    loadVenues(ownerId, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID, Nombre, Calle, CodigoPostal FROM Locales WHERE OwnerId = '${ownerId}';`;
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let venueList = [];
                    rows.forEach((row) => {
                        let venue = localFactory(row.Nombre, row.Calle, row.CodigoPostal, row.UUID);
                        venueList.push(venue);
                    })
                    callback(null, venueList);
                }
            });
        });
    }
}

module.exports = { 
    UserTableGateway,
    LocalTableGateway
}