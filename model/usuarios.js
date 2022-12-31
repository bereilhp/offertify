const bcrypt = require('bcrypt');
const uuid = require('uuid');

let { OfertaTableGateway, ResennaTableGateway, UserTableGateway, ReservaTableGateway } = require('../database/database');
const { resennaFactory } = require('./resennas');
const { reservaFactory } = require('./reservas');

const User = class User {
    constructor(uuid, name, hash) {
        this.uuid = uuid;
        this.name = name;
        this.hash = hash;
        this.rol = undefined;
    }
};

const Client = class Client extends User {
    constructor(uuid, name, hash, reservas = [], resennas = []) {
        super(uuid, name, hash);
        this.rol = 'user';
        this.reservas = reservas;
        this.resennas = resennas;
    }

    /**
     * Método para crear Reseñas
     * 
     * @param {string} descripcion Texto de la reseña
     * @param {string} idReserva Id de la reserva asociada a la reseña
     * @param {function(Resenna | null)} callback Callback ejecutado al finalizar la operación. Devuelve la Reseña creada
     * o `null` si hay algún error.
     */
    hacerResenna(descripcion, idReserva, callback) {
        const reservaTableGateway = new ReservaTableGateway();
        const resennaTableGateway = new ResennaTableGateway();

        const resenna = resennaFactory(descripcion);
        const userId = this.uuid;
        reservaTableGateway.getIdOferta(idReserva, function(err, idOferta) {
            if(err) {
                console.log(err);
            } else {
                resennaTableGateway.insertResenna(resenna.uuid, resenna.descripcion, userId, idOferta, function(err) {
                    if (err) {
                        console.log(err);
                        callback(null);
                    } else {
                        callback(resenna);
                    }
                });
            }
        });
    }

    /**
     * Método para crear reservas.
     * 
     * @param {string} idOferta Id de la oferta asociada a la reserva.
     * @param {int} telefono Teléfono asociado a la reserva
     * @param {string} hora String que contiene la hora. Formato HH:MM
     * @param {string} dia String que contiene el día. Formato DD/MM/AAAA
     * @param {function(Reserva | null)} callback Callback ejecutado al finalizar la operación. Devuelve la Reserva creada
     * o `null` si hay algún error.
     */
    hacerReserva(idOferta, telefono, hora, dia, callback) {
        const reservaTableGateway = new ReservaTableGateway();
        const reserva = reservaFactory(hora, dia, telefono, idOferta);

        reservaTableGateway.insertReserva(reserva.uuid, reserva.telefono, reserva.hora, reserva.dia, this.uuid, reserva.idOferta, function(err) {
            if (err) {
                console.log(err);
                callback(null)
            } else {
                callback(reserva);
            }
        });
    }

    /**
     * Función que cancela una reserva.
     * 
     * @param {string} idReserva Id de la Reserva a cancelar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    cancelarReserva(idReserva, callback) {
        const reservaTableGateway = new ReservaTableGateway();
        reservaTableGateway.deleteReserva(idReserva, callback);
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

    /**
     * Método para borrar ofertas.
     * 
     * @param {string} idOferta Id de la oferta a borrar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    borrarOferta(idOferta, callback) {
        const ofertaTableGateway = new OfertaTableGateway();
        ofertaTableGateway.deleteOferta(idOferta, callback);
    }

    /**
     * Método para borrar reseñas.
     * 
     * @param {string} idResenna Id de la reseña a borrar.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    borrarResenna(idResenna, callback) {
        const resennaTableGateway = new ResennaTableGateway();
        resennaTableGateway.deleteResenna(idResenna, callback);
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
            const userTableGateway = new UserTableGateway();
            userTableGateway.insertUser(user.uuid, user.name, user.hash, user.rol, function(err) {
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