const sqlite3 = require('sqlite3');
const path = require('path');
const { userFactory } = require('../model/usuarios');
const { localFactory } = require('../model/locales');
const { mensajeFactory } = require('../model/mensajes');
const { ofertaFactory } = require('../model/ofertas');
const { chatFactory } = require('../model/chats');
const { reservaFactory } = require('../model/reservas');
const { resennaFactory } = require('../model/resennas');

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
    insertVenue(uuid, name, calle, codigoPostal, logo, ownerUUID, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Locales (UUID, Nombre, Calle, CodigoPostal, Logo, OwnerId) VALUES ('${uuid}', '${name}', '${calle}', ${codigoPostal}, '${logo}', '${ownerUUID}');`;
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
     * @param {function(any | null, array<Local> | null)} callback Callback ejecutado al cargar los locales. Si todo va bien, devuelve 
     * una lista de locales y err será null.
     */
    loadVenues(ownerId, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID, Nombre, Calle, CodigoPostal, Logo FROM Locales WHERE OwnerId = '${ownerId}';`;
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let venueList = [];
                    rows.forEach((row) => {
                        let venue = localFactory(row.Nombre, row.Calle, row.CodigoPostal, row.Logo, row.UUID);
                        venueList.push(venue);
                    })
                    callback(null, venueList);
                }
            });
        });
    }
}

const MessageTableGateway = class MessageTableGateway {

    /**
     * Función que inserta un mensaje en la base de datos
     * 
     * @param {string} messageId UUID del mensaje
     * @param {string} text Cuerpo del mensaje
     * @param {string} senderId Id del sender del mensaje
     * @param {string} chatId Id del chat al que pertenece el mensaej
     * @param {function(any | null)} callback Callback que se ejecuta al finalizar la inserción. Devuelve `null` si todo
     * es correcto, o el error correspondiente si hay algún problema
     */
    insertMessage(messageId, text, senderId, chatId, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Mensajes (UUID, Texto, SenderId, ChatId) VALUES ('${messageId}', '${text}', '${senderId}', '${chatId}');`;
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
     * Función que carga todos los mensajes asociacos a un chat.
     *  
     * @param {string} chatId Id del chat al que pertenece el mensaje
     * @param {function(any | null, array<Mensaje> | null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de mensajes y err será null.
     */
    loadMessages(chatId, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID, Texto, Timestamp, SenderId FROM Mensajes WHERE ChatId = '${chatId}';`;
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let messageList = [];
                    rows.forEach((row) => {
                        let msg = mensajeFactory(row.SenderId, row.Texto, row.Timestamp, row.UUID);
                        messageList.push(msg);
                    })
                    callback(null, messageList);
                }
            });
        });
    }
}

const ChatTableGateway = class MessageTableGateway {
    /**
     * 
     * @param {string} chatId id del chat a insertar
     * @param {string} ownerId id del Owner asociado al chat
     * @param {string} userId id del Cliente asociado al chat
     * @param {string} reservaId id de la reserva asociada al chat
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve el chat insertado
     */
    insertChat(chatId, ownerId, userId, reservaId, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Chats (UUID, UserId, OwnerId, IdReserva) VALUES ('${chatId}', '${ownerId}', '${userId}', '${reservaId}');`;
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
     * Función que recupera un chat de la base de datos, basándose en la `Reserva` a la que pertenece.
     *  
     * @param {string} reservaId Id de la reserva a la que pertenece el chat
     * @param {function(any | null, Chat | null)} callback Callback ejecutado al cargar el chat. Si todo va bien, devuelve 
     * un chat y err será null.
     */
    loadChat(reservaId, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID FROM Chats WHERE IdReserva = '${reservaId}'`;
            db.get(statement, function(err, row) {
                if (err) {
                    callback(err, null);
                } else {
                    let chat = chatFactory(row.UUID);
                    callback(null, chat);
                }
            });
        });
    }
}

const OfertaTableGateway = class OfertaTableGateway {

    /**
     * 
     * @param {string} ofertaId Id de la oferta
     * @param {string} precio Precio de la oferta
     * @param {string} descripcion Descripción de la oferta
     * @param {string} foto URL de la imagen asociada a la oferta
     * @param {int} activa `1` si la oferta está activa, `0` si no
     * @param {string} ownerId Id del dueño creador de la oferta
     * @param {string} localId Id del local asociado a la oferta
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve `null` o el error
     * producido.
     */
    insertOferta(ofertaId, precio, descripcion, foto, activa, ownerId, localId, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Ofertas (UUID, Precio, Descripcion, Foto, Activa, OwnerId, LocalId) VALUES ('${ofertaId}', '${precio}', '${descripcion}', '${foto}', '${activa}', '${ownerId}', '${localId}');`;
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
     * Función que carga todas las ofertas asociadas a un local.
     *  
     * @param {string} localId Id del local al que pertenece la oferta
     * @param {function(any | null, array<Oferta>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de ofertas y err será null.
     */
    loadOfertas(localId, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID, Precio, Descripcion, Foto, Activa FROM Ofertas WHERE LocalId = '${localId}';`;
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let ofertasList = [];
                    rows.forEach((row) => {
                        let oferta = ofertaFactory(row.Foto, row.Precio, row.Activa, row.Descripcion, row.UUID);
                        ofertasList.push(oferta);
                    })
                    callback(null, ofertasList);
                }
            });
        });
    }
}

const ReservaTableGateway = class ReservaTableGateway {

    /**
     * Función que inserta una reserva en la Base de Datos.
     * 
     * @param {string} idReserva Id de la reserva a insertar.
     * @param {int} telefono Teléfono del usuario que realiza la reseña.
     * @param {string} hora String conteniendo la hora.
     * @param {string} dia String con la fecha de la reserva.
     * @param {string} userId Id del usuario que realiza la reserva.
     * @param {string} idOferta Id de la oferta asociada a la reserva.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve `null` o el error
     * producido.
     */
    insertReserva(idReserva, telefono, hora, dia, userId, idOferta, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Reservas (UUID, Telefono, Hora, Dia, UserId, OfertaId) VALUES ('${idReserva}', '${telefono}', '${hora}', '${dia}', '${userId}', '${idOferta}');`;
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
     * Función que carga todas las reservas asociadas a un usuario.
     *  
     * @param {string} userId Id del usuario al que pertenece la reserva
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de reservas y err será null.
     */
    loadReservas(userId, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID, Telefono, Hora, Dia, OfertaId FROM Reservas WHERE UserId = '${userId}';`;
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let reservasList = [];
                    rows.forEach((row) => {
                        let reserva = reservaFactory(row.Hora, row.Dia, row.Telefono, row.OfertaId, row.UUID);
                        reservasList.push(reserva);
                    })
                    callback(null, reservasList);
                }
            });
        });
    }
}

const ResennaTableGateway = class ResennaTableGateway {

    /**
     * Método qu inserta una reseña en la Base de Datos.
     * 
     * @param {string} idResenna Id de la Reseña a insertar.
     * @param {string} descripcion Descripción dejada por el usuario.
     * @param {string} userId Id del usuario que realiza la reseña.
     * @param {string} ofertaId Id de la oferta asociada a la reseña.
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve `null` o el error
     */
    insertResenna(idResenna, descripcion, userId, ofertaId, callback) {
        db.serialize(() => {
            const statement = `INSERT INTO Resennas (UUID, descripcion, UserId, OfertaId) VALUES ('${idResenna}', '${descripcion}', '${userId}', '${ofertaId}');`;
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
     * Función que carga todas las reseñas asociadas a una oferta.
     *  
     * @param {string} ofertaId Id de la oferta a la que pertenece la reseña
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de reseñas y err será null.
     */
    loadResennas(ofertaId, callback) {
        db.serialize(() => {
            const statement = `SELECT UUID, Descripcion FROM Resennas WHERE OfertaId = '${ofertaId}';`;
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let resennasList = [];
                    rows.forEach((row) => {
                        let resenna = resennaFactory(row.Descripcion, row.UUID);
                        resennasList.push(resenna);
                    })
                    callback(null, resennasList);
                }
            });
        });
    }
}

module.exports = { 
    UserTableGateway,
    LocalTableGateway,
    MessageTableGateway,
    ChatTableGateway,
    OfertaTableGateway,
    ReservaTableGateway,
    ResennaTableGateway
}