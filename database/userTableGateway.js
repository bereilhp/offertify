const path = require('path');
const sqlite3 = require('sqlite3');
const TableGateway = require('./tableGateway');
const { userFactory } = require('../model/usuarios');
//let db = require('./database');

let DB_PATH = path.join(__dirname, 'database.db');

const UserTableGateway = class UserTableGateway extends TableGateway {
    constructor() {
        super(DB_PATH);
    }

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
        const statement = `INSERT INTO Usuarios (UUID, Nombre, Hash, Rol) VALUES ('${uuid}', '${name}', '${hash}', '${role}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga un usuario de la base de datos.
     *  
     * @param {string} name Nombre del usuario
     * @param {function(err, user)} callback Callback ejecutado al cargar el usuario. Si todo va bien, devuelve 
     * un usuario y err será null.
     */
    loadUser(name, callback) {
        const statement = `SELECT UUID, Hash, Rol FROM Usuarios WHERE Nombre = '${name}'`;
        let db = new sqlite3.Database(DB_PATH, () => {
            db.serialize(() => {
                db.get(statement, function(err, row) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        const userCreatedCallback = function(user) {
                            callback(null, user);
                        }
                        userFactory(name, row.Hash, row.Rol, userCreatedCallback, row.UUID);
                    }
                });
            });
            db.close();
        });
    }

    userExists(name, callback) {
        const statement = `SELECT COUNT(*) AS Usuario FROM Usuarios WHERE Nombre = '${name}'`;
        const userChecker = function(row) {
            return row.Usuario !== 0;
        }
        this.get(statement, userChecker, callback);
    }
}

module.exports = UserTableGateway;