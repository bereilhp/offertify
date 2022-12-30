const bcrypt = require('bcrypt');
const uuid = require('uuid');

let { UserTableGateway } = require('../database/database');

const User = class User {
    constructor(uuid, name, hash) {
        this.uuid = uuid;
        this.name = name;
        this.hash = hash;
        this.rol = undefined;
    }
};

const Client = class Client extends User {
    constructor(uuid, name, hash, reservas = []) {
        super(uuid, name, hash);
        this.rol = 'user';
    }

    hacerResenna(descripcion) {
        // TO DO
    }

    hacerReserva(telefono, hora, dia) {
        // TO DO       
    }

    cancelarReserva(id) {
        // TO DO
    }
};

const Owner = class Owner extends User {
    constructor(uuid, name, hash, ofertas=[], locales=[]) {
        super(uuid, name, hash);
        this.rol = 'owner';
        this.ofertas = ofertas;
        this.locales = locales;
    }

    hacerOferta(foto, precio, descripcion, local) {
        // TO DO
    }

    editarOferta(idOferta, foto = null, precio = null, descripcion = null) {
        // TO DO
    }

    desactivarOferta(idOferta) {
        // TO DO
    }

    crearLocal(nombre, calle, codigoPostal, logo) {
        // TO DO
    }

    editarLocal(idLocal, nombre = null, calle = null, codigoPostal = null, logo = null) {
        // TO DO
    }

    borrarLocal(idLocal) {
        // TO DO
    }
};

const Admin = class Admin extends User {
    constructor(uuid, name, hash) {
        super(uuid, name, hash);
        this.rol = 'admin';
    }

    borrarOferta(idOferta) {
        // TO DO
    }
    
    borrarResenna(idResenna) {
        // TO DO
    }
};

/**
 * Función que crea un usuario nuevo. Opcionalmente toma como parámetro su UUID, si no recibe un UUID
 * generará uno.
 * 
 * @param {string} name Nombre del usuario
 * @param {string} hash Hash de la contraseña del usuario
 * @param {string} rol Rol del usuario
 * @param {string | null} userId UUID del usuario, null si se debe generar uno nuevo
 * @returns 
 */
function userFactory(name, hash, rol, userId = null) {
    userId = userId ?? uuid.v4();
    switch(rol) {
        case 'user':
            return new Client(userId, name, hash);
        case 'owner':
            return new Owner(userId, name, hash);
        case 'admin':
            return new Admin(userId, name, hash);
        default:
            return null;
    }
}

/**
 * Función que registra un usuario nuevo.
 * 
 * @param {string} name Nombre del Usuario
 * @param {string} password Contraseña del usuario
 * @param {string} rol Rol del usuario
 * @param {function(err, user)} callback Función a ejecutar una vez registrado el usuario. Toma como parámetro `err`
 * (`null` si no hay errores) y `user` (usuario creado o `null` si ha habido un error)
 */
function registerUser(name, password, rol, callback) {
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
       if (err) {
            callback(err, null);
       } else {
            let user = userFactory(name, hash, rol);
            const utg = new UserTableGateway();
            utg.insertUser(user.uuid, user.name, user.hash, user.rol, function(err) {
                if(err) {
                    callback(err, user);
                } else {
                    callback(null, user);
                }
            })
       }
    });
}

module.exports = {
    User,
    Client,
    Owner,
    Admin,
    userFactory,
    registerUser
}