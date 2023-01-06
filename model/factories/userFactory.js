const uuid = require('uuid');
const { Client, Owner, Admin } = require('../usuarios');
const { ReservaTableGateway } = require('../database/reservaTableGateway');
const { ResennaTableGateway } = require('../database/resennaTableGateway');
const { LocalTableGateway } = require('../database/localTableGateway');

/**
 * Función que crea un usuario nuevo. Opcionalmente toma como parámetro su UUID, si no recibe un UUID
 * generará uno.
 * 
 * @param {string} name Nombre del usuario
 * @param {string} hash Hash de la contraseña del usuario
 * @param {string} rol Rol del usuario
 * @param {function(User | null)} callback Función a ejecutar una vez registrado el usuario. Toma como parámetro el usuario creado:
 * (o `null` si ha habido un error)
 * @param {string | null} userId UUID del usuario, null si se debe generar uno nuevo
 */
function userFactory(name, hash, rol, callback, userId = null) {
    userId = userId ?? uuid.v4();
    let builder = null;
    switch(rol) {
        case 'user':
            builder = new ClientBuilder(name, hash, userId);
            break;
        case 'owner':
            builder = new OwnerBuilder(name, hash, userId);
            break;
        case 'admin':
            callback(new Admin(userId, name, hash));
            return;
        default:
            callback(null);
            return;
    }

    builder.build(callback);
}

const UserBuilder = class UserBuilder {
    /**
     * Método abstracto usado para construir usuarios. Deberá ser sobreescito por las subclases
     * 
     * @param {function(User | null)} callback Función a ejecutar al finalizar la creación. Devuelve el usuario
     * construido o `null` si ha habido algún error.
     * @throws Not Implemented Error
     */
    build(callback) {
        throw Error('Not Implemented Error');
    }
}

const ClientBuilder = class ClientBuilder extends UserBuilder {
    constructor(name, hash, userId) {
        super();
        this.user = new Client(userId, name, hash);
    }

    /**
     * Método para construir Clientes.
     * 
     * @param {function(User | null)} callback Función a ejecutar al finalizar la creación. Devuelve el usuario
     * construido o `null` si ha habido algún error.
     */
    build(callback) {
        const reservaTableGateway = new ReservaTableGateway(); 
        let user = this.user;
        reservaTableGateway.loadReservas(user.uuid, function(err, reservas) {
            if (err) {
                console.log(err);
                callback(null);
            } else {
                user.reservas = reservas;
                callback(user);
            }
        });
    }
}

const OwnerBuilder = class OwnerBuilder extends UserBuilder {
    constructor(name, hash, uuid) {
        super();
        this.owner = new Owner(uuid, name, hash);
    }

    /**
     * Método para construir Dueños.
     * 
     * @param {function(User | null)} callback Función a ejecutar al finalizar la creación. Devuelve el usuario
     * construido o `null` si ha habido algún error.
     */
    build(callback) {
        const localTableGateway = new LocalTableGateway(); 
        const ofertaTableGateway = new OfertaTableGateway(); 

        let owner = this.owner;
        localTableGateway.loadVenues(owner.uuid, function(err, locales) {
            if (err) {
                console.log(err);
                callback(null);
            } else {
                owner.locales = locales;
                ofertaTableGateway.loadOfertas(owner.uuid, function(err, ofertas) {
                    owner.ofertas = ofertas;
                    callback(owner);
                });
            }
        });
    }
}

module.exports = {
    userFactory
}