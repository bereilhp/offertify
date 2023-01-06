const path = require('path');
const { mensajeFactory } = require("../model/mensajes");
const TableGateway = require("./tableGateway");

let DB_PATH = path.join(__dirname, 'database.db');

const MessageTableGateway = class MessageTableGateway extends TableGateway {
    constructor() {
        super(DB_PATH);
    }

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

module.exports = MessageTableGateway;