const sqlite3 = require('sqlite3');
const path = require('path');

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
     * @param {*} hash 
     * @param {string} role 
     * @param {function} callback Callback ejecutado al finalizar la inserción. Devuelve el usuario insertado
     */
    insertUser(uuid, name, hash, role, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Usuarios (UUID, Nombre, Hash, Rol) VALUES ('${uuid}', '${name}', ${hash}, '${role}');`;

            db.run(statement, function(err) {
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
        });
    } 
}

module.exports = { 
    UserTableGateway
}