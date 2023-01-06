const rewire = require('rewire');
const chats = require('../../model/chats');
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
    beforeAll(() => {
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
        });
        
        database.__set__({ db: db });
    });
    
    test('chatFactory() crea Chats', done => {
        const callback = function(chat) {
            expect(chat).toBeInstanceOf(Chat);

            done();
            return;
        }
        chatFactory("Soy un Mensaje", callback);
    });

    test('chatFactory() crea uuids diferentes para cada chat', done => {
        chatFactory("Soy un Chat", function(chat_1) {
            chatFactory("Soy un Chat", function(chat_2) {
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
        chatFactory("Soy un Mensaje", callback, 'id');
    });
});