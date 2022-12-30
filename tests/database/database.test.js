const sqlite3  = require('sqlite3');
const rewire = require('rewire');
const fs = require('fs');
const path = require('path');
const { Client, Owner, Admin } = require('../../model/usuarios');
const { Local } = require('../../model/locales');
const { Chat } = require('../../model/chats');
const { Mensaje } = require('../../model/mensajes');
const { Oferta } = require('../../model/ofertas');

const database = rewire('../../database/database');

test('Módulo database se conecta a base de datos', () => {
    const db = database.__get__('db');
    expect(db).toBeInstanceOf(sqlite3.Database);
});

test('Módulo database se conecta a la base de datos adecuada', done => {
    const db = database.__get__('db');
    const expectedTables = ['Usuarios', 'Locales', 'Ofertas', 'Reservas', 'Chats', 'Mensajes', 'Resennas'];
    db.all('SELECT name FROM sqlite_master WHERE type="table"', function (err, tables) {
        let foundAll = true;
        for (let i = 0; i < tables.length; i++) {
            foundAll &&= expectedTables.includes(tables[i].name);
        }
        expect(foundAll).toBeTruthy();

        // Indicamos a jest que ya puede evaluar el resultado del callback
        done();
        return;
    });
});

describe('Tests que requieren base de datos de pruebas', () => {
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

    afterAll(() => {
        database.__get__('db').close();
    });

    test('UserTableGateway tiene operación para insertar usuario', done => {
        const UserTableGateway = database.UserTableGateway;

        const uuid = '12325677901234567890123456789012';
        const name = 'Usuario 1';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        utg = new UserTableGateway();  
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('UserTableGateway tiene operación para recuperar Usuario', done => {
        const db = database.__get__('db');
        const UserTableGateway = database.UserTableGateway;

        const uuid = '12345678901334567890123456789012';
        const name = 'Usuario 2';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {});
        utg.loadUser(user.name, function(err, user) {
            if (err) {
                done(err);
                return;
            } else {
                expect(user.uuid).toBe(uuid);
                done();
                return;
            }
        });
    });
    
    test('UserTableGateway recupera Clientes para rol user', done => {
        const db = database.__get__('db');
        const UserTableGateway = database.UserTableGateway;

        const uuid = '12345678901234567890123456789016';
        const name = 'Cliente 1';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {});
        utg.loadUser(user.name, function(err, user) {
            if (err) {
                done(err);
                return;
            } else {
                expect(user.rol).toBe('user');
                done();
                return;
            }
        });
    });
    
    test('UserTableGateway recupera Admins para rol admin', done => {
        const db = database.__get__('db');
        const UserTableGateway = database.UserTableGateway;

        const uuid = '12345678901234567890123456789014';
        const name = 'Admin 1';
        const hash = 0x01;
        const user = new Admin(uuid, name, hash);

        utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {});
        utg.loadUser(user.name, function(err, user) {
            if (err) {
                done(err);
                return;
            } else {
                expect(user.rol).toBe('admin');
                done();
                return;
            }
        });
    });
    
    test('UserTableGateway recupera Dueños para rol owner', done => {
        const db = database.__get__('db');
        const UserTableGateway = database.UserTableGateway;

        const uuid = '12345678901234567890123456789013';
        const name = 'Owner 1';
        const hash = 0x01;
        const user = new Owner(uuid, name, hash);

        utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {});
        utg.loadUser(user.name, function(err, user) {
            if (err) {
                done(err);
                return;
            } else {
                expect(user.rol).toBe('owner');
                done();
                return;
            }
        });
    });

    test('LocalTableGateway tiene operación para insertar Local', done => {
        const LocalTableGateway = database.LocalTableGateway;

        const ownerUuid = '12345678901234567890123456789013';
        const name = 'Owner 1';
        const hash = 0x01;
        const owner = new Owner(ownerUuid, name, hash);

        const venueUuid = 'id';
        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'
        const local = new Local(venueUuid, nombre, calle, codigoPostal, logo);

        ltg = new LocalTableGateway();  
        ltg.insertVenue(local.uuid, local.name, local.hash, local.codigoPostal, local.logo, owner.uuid, function(err) {
            // Verificamos que se ha insertado el local correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('LocalTableGateway tiene operación para cargar todos los Locales', done => {
        const db = database.__get__('db');
        const LocalTableGateway = database.LocalTableGateway;

        const ownerUuid = '12345678234234567890123456789013';
        const name = 'Owner 1';
        const hash = 0x02;
        const owner = new Owner(ownerUuid, name, hash);

        const venueUuid = 'asdfasdf';
        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'
        const local = new Local(venueUuid, nombre, calle, codigoPostal, logo);

        ltg = new LocalTableGateway();  
        ltg.insertVenue(local.uuid, local.name, local.hash, local.codigoPostal, local.logo, owner.uuid, () => {});
        ltg.loadVenues(owner.uuid, function(err, venueList) {
            if (err) {
                done(err);
                return;
            } else {
                expect(venueList[0].uuid).toBe(local.uuid);
                done();
                return;
            }
        });
    });

    test('ChatTableGateway tiene operación para insertar chat', done => {
        const ChatTableGateway = database.ChatTableGateway;

        const ownerId = '12338677901224867893123359789012';
        const userId = '12325677931224562893123336789012';
        const reservaId = '12325277902224587493129356489010';
        const chatId = 'efifj4040402850gj20fj40gn20n9012';
        const chat = new Chat(chatId);

        ctg = new ChatTableGateway();  
        ctg.insertChat(chatId, ownerId, userId, reservaId, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('ChatTableGateway tiene operación para recuperar Chat', done => {
        const db = database.__get__('db');
        const ChatTableGateway = database.ChatTableGateway;

        const ownerId = '12338677901224867893123359789012';
        const userId = '12325677931224562893123336789012';
        const reservaId = '203858f0f2j0j40j20fj04jt05jf0201';
        const chatId = '30f84jf0nvn0n40wmfme0gm40hn20384';
        const chat = new Chat(chatId);

        ctg = new ChatTableGateway();
        ctg.insertChat(chat.uuid, ownerId, userId, reservaId, () => {});
        ctg.loadChat(reservaId, function(err, loadedChat) {
            if (err) {
                done(err);
                return;
            } else {
                expect(loadedChat.uuid).toBe(chat.uuid);
                done();
                return;
            }
        });
    });

    test('MessageTableGateway tiene operación para insertar mensaje', done => {
        const MessageTableGateway = database.MessageTableGateway;

        const senderUuid = '12345678234234567890123456789013';
        const senderName = 'Message Sender 1';
        const senderHash = 0x02;
        const sender = new Owner(senderUuid, senderName, senderHash);

        const chatId = '34fjrj3480288050jf0j0j48th028hfn';
        const messageId = '123056779s122456789a12335w789-12';
        const texto = 'Mensaje de Prueba';
        const timestamp = null
        const message = new Mensaje(messageId, sender, texto, timestamp);

        mtg = new MessageTableGateway();  
        mtg.insertMessage(message.uuid, message.texto, sender.uuid, chatId, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('MessageTableGateway tiene operación para cargar todos los Mensajes', done => {
        const MessageTableGateway = database.MessageTableGateway;

        const senderUuid = '12345678234234567890123456789013';
        const senderName = 'Message Sender 1';
        const senderHash = 0x02;
        const sender = new Owner(senderUuid, senderName, senderHash);

        const chatId = '1232167700122436789l123356789012';
        const messageId = '12325677901224567893123356789012';
        const texto = 'Mensaje de Prueba';
        const timestamp = null
        const message = new Mensaje(messageId, sender, texto, timestamp);

        mtg = new MessageTableGateway();  
        mtg.insertMessage(message.uuid, message.texto, sender.uuid, chatId, () => {});
        mtg.loadMessages(chatId, function(err, messageList) {
            if (err) {
                done(err);
                return;
            } else {
                expect(messageList[0].uuid).toBe(message.uuid);
                done();
                return;
            }
        });
    });
    
    test.skip('OfertaTableGateway tiene operación para insertar oferta', done => {
        const OfertaTableGateway = database.OfertaTableGateway;

        const ownerId = '12325c779012i4567890123456789012';
        const localId = '42c2527790120456789j123456789012';
        const ofertaId = '9142-247901204567899123h56789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 1';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test.skip('OfertaTableGateway tiene operación para recuperar lista de ofertas', done => {
        const OfertaTableGateway = database.OfertaTableGateway;

        const ownerId = '1232asdf2308f003fwefj03rewe0fjqf';
        const localId = '3asdfj30w02jfjs030ja0dfj30fjae0f';
        const ofertaId = '4ql3kekf039fjw03jt04j0ejf03j0402';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 2';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {});
        otg.loadOfertas(localId, function(err, ofertasList) {
            if (err) {
                done(err);
                return;
            } else {
                expect(ofertasList[0].uuid).toBe(oferta.uuid);
                done();
                return;
            }
        });
    });
});