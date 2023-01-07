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
}

module.exports = ChatTableGateway;