const bcrypt = require('bcrypt');
const uuid = require('uuid');

let { OfertaTableGateway, ResennaTableGateway, UserTableGateway, ReservaTableGateway, LocalTableGateway } = require('../database/database');
const { localFactory } = require('./locales');
const { ofertaFactory } = require('./ofertas');
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

    /**
     * Método para crear ofertas.
     * 
     * @param {string} foto URL de la foto asociada a la oferta
     * @param {float} precio Precio de la oferta.
     * @param {string} descripcion Descripción de la oferta
     * @param {string} idLocal Id del local asociado a la oferta
     * @param {function(Oferta | null)} callback Callback ejecutado al finalizar la operación. Devuelve la oferta creada
     * o `null` si hay algún error.
     */
    hacerOferta(foto, precio, descripcion, idLocal, callback) {
        const ofertaTableGateway = new OfertaTableGateway();
        const oferta = ofertaFactory(foto, precio, 1, descripcion);
        const ofertas = this.ofertas;

        ofertaTableGateway.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, this.uuid, idLocal, function(err) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                ofertas.push(oferta);
                callback(null, oferta);
            }
        });
    }

    /**
     * Función para actualizar una oferta.
     * 
     * @param {string} idOferta Id de la oferta a editar
     * @param {string | null} foto Nueva url de la foto, `null` si no se desea actualizar la url.
     * @param {float | null} precio Nuevo precio para la oferta, `null` si no se desea cambiar.
     * @param {string | null} descripcion Nueva descripción para la oferta, `null` si no se desea actualizar.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` si no hay 
     * errores o el error en caso de que ocurra.
     */
    editarOferta(idOferta, foto = null, precio = null, descripcion = null, callback) {
        const ofertaTableGateway = new OfertaTableGateway();
        let ofertaACambiar = null;

        this.ofertas.forEach((oferta) => {
            if (oferta.uuid === idOferta) {
                oferta.foto = foto ?? oferta.foto;
                oferta.precio = precio ?? oferta.precio;
                oferta.descripcion = descripcion ?? oferta.descripcion;

                ofertaACambiar = oferta;
            }
        });

        ofertaTableGateway.updateOferta(ofertaACambiar.uuid, ofertaACambiar.precio, ofertaACambiar.descripcion, ofertaACambiar.foto, ofertaACambiar.activa, callback);
    }

    /**
     * Método para desactivar una oferta.
     * 
     * @param {string} idOferta Id de la oferta a desactivar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` si no hay 
     * errores o el error en caso de que ocurra.
     */
    desactivarOferta(idOferta, callback) {
        const ofertaTableGateway = new OfertaTableGateway();
        let ofertaADesactivar = null;

        this.ofertas.forEach((oferta) => {
            if (oferta.uuid === idOferta) {
                oferta.activa = 0;
                ofertaADesactivar = oferta;
            }
        });

        ofertaTableGateway.updateOferta(ofertaADesactivar.uuid, ofertaADesactivar.precio, ofertaADesactivar.descripcion, ofertaADesactivar.foto, ofertaADesactivar.activa, callback);
    }

    /**
     * 
     * @param {string} nombre Nombre del local
     * @param {string} calle Calle del local
     * @param {int} codigoPostal Código postal del local
     * @param {string} logo URL del logo del local.
     * @param {function(Local | null)} callback Callback ejecutado al finalizar la operación. Devuelve el local creado
     * o `null` si hay algún error.
     */
    crearLocal(nombre, calle, codigoPostal, logo, callback) {
        const localTableGateway = new LocalTableGateway();
        const local = localFactory(nombre, calle, codigoPostal, logo);
        const locales = this.locales;

        localTableGateway.insertVenue(local.uuid, local.nombre, local.calle, local.codigoPostal, local.logo, this.uuid, function(err) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                locales.push(local);
                callback(null, local);
            }
        });
    }

    /**
     * Método para editar un local existente.
     * 
     * @param {string} idLocal Id del local a actualizar
     * @param {string | null} nombre Nuevo nombre para el local, `null` si no se debe cambiar
     * @param {string | null} calle Nueva calle para el local, `null` si no se debe cambiar
     * @param {int | null} codigoPostal Nuevo código postal para el local, `null` si no se debe cambiar
     * @param {string | null} logo Nuevo logo para el locall, `null` si no se debe cambiar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` si no hay 
     * errores o el error en caso de que ocurra.
     */
    editarLocal(idLocal, nombre = null, calle = null, codigoPostal = null, logo = null, callback) {
        const localTableGateway = new LocalTableGateway();
        let localACambiar = null;

        this.locales.forEach((local) => {
            if (local.uuid === idLocal) {
                local.nombre = nombre ?? local.nombre;
                local.calle = calle ?? local.calle;
                local.codigoPostal = codigoPostal ?? local.codigoPostal;
                local.logo = logo ?? local.logo;

                localACambiar = local;
            }
        });

        localTableGateway.updateVenue(localACambiar.uuid, localACambiar.nombre, localACambiar.calle, localACambiar.codigoPostal, localACambiar.local, callback);
    }

    /**
     * Método para eliminar locales.
     * 
     * @param {string} idLocal Id del local a eliminar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` si no hay 
     * errores o el error en caso de que ocurra.
     */
    borrarLocal(idLocal, callback) {
        const localTableGateway = new LocalTableGateway();

        let localABorrar = null; 
        let found = false;

        for (let i = 0; i < this.locales.length && !found; i++) {
            if (this.locales[i].uuid === idLocal) {
                localABorrar = this.locales.splice(i, 1)[0];
                found = true;
            }
        }

        localTableGateway.deleteVenue(localABorrar.uuid, callback);
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

const UserBuilder = class UserBuilder {
    /**
     * Método abstracto usado para construir usuarios. Deberá ser sobreescito por las subclases
     * 
     * @throws Not Implemented Error
     */
    build() {
        throw Error('Not Implemented Error');
    }
}

module.exports = {
    User,
    Client,
    Owner,
    Admin,
    userFactory,
    registerUser
}