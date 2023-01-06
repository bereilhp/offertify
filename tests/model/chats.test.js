const rewire = require('rewire');
const chats = rewire('../../model/chats');
const { Mensaje } = require('../../model/mensajes');
const { Owner } = require('../../model/usuarios');
const Chat = chats.Chat;
const chatFactory = chats.chatFactory;


test('Chat tiene uuid', () => {
    const uuid = 'id';
    const mensajes = 'Mensaje';
    const chat = new Chat(uuid, mensajes);
    expect(chat.uuid).toBe(uuid);
})

test('Chat tiene uuid', () => {
    const uuid = 'id';
    const mensajes = 'Mensaje';
    const chat = new Chat(uuid, mensajes);
    expect(chat.mensajes).toBe(mensajes);
})

describe('Tests que requieren Mock de BBDD', () => {
    const sqlite3 = require('sqlite3');
    const fs = require('fs');
    const path = require('path');
    const database = rewire('../../database/database');

    // Antes de todos los tests, se sustituye la BBDD original por una BBDD en memoria
    beforeAll(done => {
        const db = new sqlite3.Database(':memory:', function(err) {
            const sqlCreationScript = fs.readFileSync(
                path.join(__dirname, '..', '..', 'database', 'creation_script.sql')
            );
            const statementArray = sqlCreationScript.toString().split(';');
    
            db.serialize(() => {
                statementArray.forEach((statement) => {
                    // NOTA -> Al separar por ;, la última posición del array es un espacio en blanco.
                    //         Sqlite interpreta esto como un error y hace que fallen los tests
                    if (statement !== statementArray[statementArray.length - 1] ) {
                        statement += ';';           // Volvemos a añadir el ; al final del statement
                        db.run(statement);
                    }
                });
            });
            database.__set__({ db: db });

            done();
            return;
        });
    });

    afterAll(() => {
        database.__get__('db').close();
    });
    
    test('chatFactory() crea Chats', done => {
        const callback = function(chat) {
            expect(chat).toBeInstanceOf(Chat);

            done();
            return;
        }
        chatFactory(callback);
    });

    test('chatFactory() crea uuids diferentes para cada chat', done => {
        chatFactory(function(chat_1) {
            chatFactory(function(chat_2) {
                expect(chat_1.uuid).not.toEqual(chat_2.uuid);

                done();
                return;
            });
        });
    });    

    test('chatFactory crea uuid sólo si no se especifica', done => {
        const callback = function(chat) {
            expect(chat.uuid).toBe('id');

            done();
            return;
        }
        chatFactory(callback, 'id');
    });

    test('chatFactory recupera los mensajes del chat', done => {
       // Creamos mensaje de prueba
        const MessageTableGateway = database.MessageTableGateway;
        chats.__set__({ MessageTableGateway: MessageTableGateway });

        const senderUuid = '12345678234234567890123456789013';
        const senderName = 'Message Sender 1';
        const senderHash = 0x02;
        const sender = new Owner(senderUuid, senderName, senderHash);

        const chatId = '30fjw0jf0340gnq0ecmwe0ng043gnhfn';
        const messageId = 'f0ajc03ng0mv03nb034nb0335w789-12';
        const texto = 'Mensaje de Prueba';
        const timestamp = null
        const message = new Mensaje(messageId, sender, texto, timestamp);

        const mtg = new MessageTableGateway();  
        mtg.insertMessage(message.uuid, message.texto, sender.uuid, chatId, function(err) {
            // Creamos el chat
            const callback = function(chat) {
                expect(chat.mensajes[0].uuid).toBe(message.uuid);

                done();
                return;
            }
            chatFactory(callback, chatId);
        });
    });

    test('escribirChat añade mensaje a lista de mensajes', done => {
        // Creamos mensaje de prueba
        const senderUuid = '0asj0efjq0en023ng03wnb03n6789013';

        const chatId = '30fjw0jf0340gnq0ecmwe0ng043gnhfn';

        const chat = new Chat(chatId);
        chat.escribirMensaje("XD", senderUuid, function(err) {
            expect(chat.mensajes[0].nombreUsuario).toBe(senderUuid);

            done();
            return;
        });
    });

    test('escribirChat guarda mensaje en BBDD', done => {
        const MessageTableGateway = database.MessageTableGateway;
        chats.__set__({ MessageTableGateway: MessageTableGateway });

        // Creamos mensaje de prueba
        const senderUuid = 'affj30vn20nv0amev0rnb003n6789013';

        const chatId = '0asdfj03nv0amdc0sdjfq3gnsdonvnfn';

        const chat = new Chat(chatId);
        chat.escribirMensaje("XD", senderUuid, function(err) {
            const mtg = new MessageTableGateway();
            mtg.loadMessages(chat.uuid, function(err, mensajes) {
                expect(chat.mensajes[0].uuid).toBe(mensajes[0].uuid);

                done();
                return;
            });
        });
    });
});