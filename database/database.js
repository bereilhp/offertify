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

const TableGateway = class TableGateway {
    /**
     * Método para ejecutar una sentencia `INSERT`, `UPDATE` o `DELETE`.
     * 
     * @param {string} statement Sentencia SQL a ejecutar. Puede ser `INSERT`, `UPDATE` o `DELETE`
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` si todo va bien,
     * un error en caso contrario 
     */
    run(statement, callback) {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            db.run(statement, function(err) {
                if (err) {
                    console.log(err);
                }
            });
            db.run('COMMIT;', function(err) {
                callback(null);
            });
        });
    }

    /**
     * Función que ejecuta una consulta SQL y devuelve un objeto creado según la `factory` indicada.
     * 
     * @param {string} statement Sentencia SQL a ejecutar.
     * @param {function(Object):Object} factory Función que toma como parámetro las filas individuales (`row`) y crea
     * un objeto con los campos necesarios.
     * @param {function(any | null, Object | null)} callback Callback a ejecutar una vez finalizada la sentencia. 
     * Toma como parámetros el objeto `row` recuperado y el error ocurrido (`null` si no hay).
     */
    get(statement, factory, callback) {
        this.all(statement, factory, function(err, resultList) {
            const result = resultList[0];
            callback(err, result);
        });
    }

    /**
     * Función que ejecuta una consulta SQL y devuelve una lista de objetos creados utilizando la `factory` indicada.
     * 
     * @param {string} statement Sentencia SQL a ejecutar.
     * @param {function(Object):Object} factory Función que toma como parámetro las filas individuales (`row`) y crea
     * un objeto con los campos necesarios.
     * @param {function(any | null, array<Object> | null)} callback Callback a ejecutar una vez finalizada la sentencia. 
     * Toma como parámetros la lista de filas ecuperada y el error ocurrido (`null` si no hay).
     */
    all(statement, factory, callback) {
        db.serialize(() => {
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let resultList = [];
                    rows.forEach((row) => {
                        let obj = factory(row);
                        resultList.push(obj);
                    })
                    callback(null, resultList);
                }
            });
        });
    }
}

const UserTableGateway = class UserTableGateway extends TableGateway {
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
        const factory = function(row) {
            return userFactory(name, row.Hash, row.Rol, row.UUID);
        }
        this.get(statement, factory, callback);
    }
}

const LocalTableGateway = class LocalTableGateway extends TableGateway{
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
}

const MessageTableGateway = class MessageTableGateway extends TableGateway {

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
        const statement = `INSERT INTO Mensajes (UUID, Texto, SenderId, ChatId) VALUES ('${messageId}', '${text}', '${senderId}', '${chatId}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga todos los mensajes asociacos a un chat.
     *  
     * @param {string} chatId Id del chat al que pertenece el mensaje
     * @param {function(any | null, array<Mensaje> | null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de mensajes y err será null.
     */
    loadMessages(chatId, callback) {
        const statement = `SELECT UUID, Texto, Timestamp, SenderId FROM Mensajes WHERE ChatId = '${chatId}';`;
        const factory = function(row) {
            return mensajeFactory(row.SenderId, row.Texto, row.Timestamp, row.UUID);
        }
        this.all(statement, factory, callback);
    }
}

const ChatTableGateway = class ChatTableGateway extends TableGateway {
    /**
     * Función que inserta un Chat en la Base de Datos.
     * 
     * @param {string} chatId id del chat a insertar
     * @param {string} ownerId id del Owner asociado al chat
     * @param {string} userId id del Cliente asociado al chat
     * @param {string} reservaId id de la reserva asociada al chat
     * @param {function(any | null)} callback Callback ejecutado al finalizar la inserción. Devuelve el chat insertado
     */
    insertChat(chatId, ownerId, userId, reservaId, callback) {
        const statement = `INSERT INTO Chats (UUID, UserId, OwnerId, IdReserva) VALUES ('${chatId}', '${ownerId}', '${userId}', '${reservaId}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que recupera un chat de la base de datos, basándose en la `Reserva` a la que pertenece.
     *  
     * @param {string} reservaId Id de la reserva a la que pertenece el chat
     * @param {function(any | null, Chat | null)} callback Callback ejecutado al cargar el chat. Si todo va bien, devuelve 
     * un chat y err será null.
     */
    loadChat(reservaId, callback) {
        const statement = `SELECT UUID FROM Chats WHERE IdReserva = '${reservaId}'`;
        const factory = function(row) {
            return chatFactory(row.UUID);
        }
        this.get(statement, factory, callback);
    }
}

const OfertaTableGateway = class OfertaTableGateway extends TableGateway {

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
     * Función que carga todas las ofertas asociadas a un local.
     *  
     * @param {string} localId Id del local al que pertenece la oferta
     * @param {function(any | null, array<Oferta>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de ofertas y err será null.
     */
    loadOfertas(localId, callback) {
        const statement = `SELECT UUID, Precio, Descripcion, Foto, Activa FROM Ofertas WHERE LocalId = '${localId}';`;
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
}

const ReservaTableGateway = class ReservaTableGateway extends TableGateway {

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
        const statement = `INSERT INTO Reservas (UUID, Telefono, Hora, Dia, UserId, OfertaId) VALUES ('${idReserva}', '${telefono}', '${hora}', '${dia}', '${userId}', '${idOferta}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga todas las reservas asociadas a un usuario.
     *  
     * @param {string} userId Id del usuario al que pertenece la reserva
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de reservas y err será null.
     */
    loadReservas(userId, callback) {
        const statement = `SELECT UUID, Telefono, Hora, Dia, OfertaId FROM Reservas WHERE UserId = '${userId}';`;
        const factory = function(row) {
            return reservaFactory(row.Hora, row.Dia, row.Telefono, row.OfertaId, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que recupera el Id de la oferta asociada a la reserva.
     *  
     * @param {string} idReserva Id de la oferta.
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve un string y err será null.
     */
    getIdOferta(idReserva, callback) {
        const statement = `SELECT OfertaId FROM Reservas WHERE UUID = '${idReserva}';`;
        const factory = function(row) {
            return row.OfertaId;
        }
        this.get(statement, factory, callback);
    }

    /**
     * Función que borra una reserva de la base de datos.
     * 
     * @param {string} idReserva Id de la reserva a borrar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    deleteReserva(idReserva, callback) {
        const statement = `DELETE FROM Reservas WHERE UUID = '${idReserva}';`;
        this.run(statement, callback);
    } 
}

const ResennaTableGateway = class ResennaTableGateway extends TableGateway {

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
        const statement = `INSERT INTO Resennas (UUID, descripcion, UserId, OfertaId) VALUES ('${idResenna}', '${descripcion}', '${userId}', '${ofertaId}');`;
        this.run(statement, callback);
    } 

    /**
     * Función que carga todas las reseñas asociadas a una oferta.
     *  
     * @param {string} ofertaId Id de la oferta a la que pertenece la reseña
     * @param {function(any | null, array<Reserva>| null)} callback Callback ejecutado al finalizar la carga. Si todo va bien, 
     * devuelve una lista de reseñas y err será null.
     */
    loadResennas(ofertaId, callback) {
        const statement = `SELECT UUID, Descripcion FROM Resennas WHERE OfertaId = '${ofertaId}';`;
        const factory = function(row) {
            return resennaFactory(row.Descripcion, row.UUID);
        }
        this.all(statement, factory, callback);
    }

    /**
     * Función que borra una reseña de la base de datos.
     * 
     * @param {string} idResenna Id de la reseña a borrar
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` o el error producido.
     */
    deleteResenna(idResenna, callback) {
        const statement = `DELETE FROM Resennas WHERE UUID = '${idResenna}';`;
        this.run(statement, callback);
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