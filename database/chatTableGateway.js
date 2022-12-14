const path = require('path');
const sqlite3 = require('sqlite3');
const TableGateway = require("./tableGateway");
let { chatFactory } = require('../model/chats');

let DB_PATH = path.join(__dirname, 'database.db');

const ChatTableGateway = class ChatTableGateway extends TableGateway {
    constructor() {
        super(DB_PATH);
    }
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
        const statement = `INSERT INTO Chats (UUID, UserId, OwnerId, IdReserva) VALUES ('${chatId}', '${userId}', '${ownerId}', '${reservaId}');`;
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
        let db = new sqlite3.Database(this.db_path, () => {
            db.serialize(() => {
                db.get(statement, function(err, row) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        const chatCreatedCallback = function(chat) {
                            callback(null, chat);
                        }
                        chatFactory(chatCreatedCallback, row.UUID);
                    }
                });
            });
        });
        db.close();
    }

    /**
     * Función que recupera un todos los chats asociados a un Owner de la base de datos.
     *  
     * @param {string} ownerId Id del dueño al que pertenecen los chats
     * @param {function(any | null, array<string> | null)} callback Callback ejecutado al cargar los chats. Si todo va bien, devuelve 
     * un chat y err será null.
     */
    loadChatIds(ownerId, callback) {
        const statement = `SELECT UUID FROM Chats WHERE OwnerId = '${ownerId}'`;
        const factory = function(row) {
            return row.UUID;
        }
        this.all(statement, factory, callback);
    }
    
    /**
     * Función que recupera el Id de la reserva asociada al chat
     *  
     * @param {string} chatId Id del chat
     * @param {function(any | null, string | null)} callback Callback ejecutado finalizar. Si todo va bien, devuelve 
     * un id y err será null.
     */
    getIdReserva(chatId, callback) {
        const statement = `SELECT IdReserva FROM Chats WHERE UUID = '${chatId}'`;
        const factory = function(row) {
            return row.IdReserva;
        }
        this.get(statement, factory, callback);
    }

    /**
     * Función que comprueba si existe un chat en la base de datos, basándose en la `Reserva` a la que pertenece.
     *  
     * @param {string} reservaId Id de la reserva a la que pertenece el chat
     * @param {function(any | null, Chat | null)} callback Callback ejecutado al finalizar la comprobaión. Si todo 
     * va bien, devuelve `true` o `false` y err será null.
     */
    existsChat(reservaId, callback) {
        const statement = `SELECT COUNT(*) AS count FROM Chats WHERE IdReserva = '${reservaId}'`;
        const checkerCallback = function(row) {
            return row.count == 1;
        }
        this.get(statement, checkerCallback, callback);
    }

    /**
     * Función que borra el chat asociado a la reserva indicada.
     *  
     * @param {string} reservaId Id de la reserva a la que pertenece el chat
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación.
     */
    deleteChat(reservaId, callback) {
        const statement = `DELETE FROM Chats WHERE IdReserva = '${reservaId}'`;
        this.run(statement, callback);
    }
}

module.exports = ChatTableGateway;