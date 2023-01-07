const sqlite3  = require('sqlite3');
const rewire = require('rewire');
const fs = require('fs');
const path = require('path');
const { Client, Owner, Admin } = require('../../model/usuarios');
const { Local } = require('../../model/locales');
const { Chat } = require('../../model/chats');
const { Mensaje } = require('../../model/mensajes');
const { Oferta } = require('../../model/ofertas');
const { Reserva } = require('../../model/reservas');
const { Resenna } = require('../../model/resennas');
const { db } = require('../../database/database');
const TableGateway = rewire('../../database/tableGateway');
const UserTableGateway = rewire('../../database/userTableGateway');
const ChatTableGateway = rewire('../../database/chatTableGateway');
const LocalTableGateway = rewire('../../database/localTableGateway');
const MessageTableGateway = rewire('../../database/messageTableGateway');
const OfertaTableGateway = rewire('../../database/ofertaTableGateway');
const ResennaTableGateway = rewire('../../database/resennaTableGateway');
const ReservaTableGateway = rewire('../../database/reservaTableGateway');

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
    beforeAll(done => {
        const DB_PATH = './test_database.db';
        const db = new sqlite3.Database(DB_PATH, function(err) {
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
        
        UserTableGateway.__set__({ DB_PATH: DB_PATH });
        ReservaTableGateway.__set__({ DB_PATH: DB_PATH });
        ResennaTableGateway.__set__({ DB_PATH: DB_PATH });
        OfertaTableGateway.__set__({ DB_PATH: DB_PATH });
        MessageTableGateway.__set__({ DB_PATH: DB_PATH });
        LocalTableGateway.__set__({ DB_PATH: DB_PATH });
        ChatTableGateway.__set__({ DB_PATH: DB_PATH });
    });

    afterAll(() => {
        fs.unlinkSync('./test_database.db');
    });

    test('UserTableGateway tiene operación para insertar usuario', done => {
        const uuid = '12325677901234567890123456789012';
        const name = 'Usuario 1';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        const utg = new UserTableGateway();  
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('UserTableGateway tiene operación para recuperar Usuario', done => {
        const uuid = '12345678901334567890123456789012';
        const name = 'Usuario 2';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        const utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {
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
    });
    
    test('UserTableGateway recupera Clientes para rol user', done => {
        const uuid = '12345678901234567890123456789016';
        const name = 'Cliente 1';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        const utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {
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
    });
    
    test('UserTableGateway recupera Admins para rol admin', done => {
        const uuid = '12345678901234567890123456789014';
        const name = 'Admin 1';
        const hash = 0x01;
        const user = new Admin(uuid, name, hash);

        const utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {
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
    });
    
    test('UserTableGateway recupera Dueños para rol owner', done => {
        const uuid = '12345678901234567890123456789013';
        const name = 'Owner 1';
        const hash = 0x01;
        const user = new Owner(uuid, name, hash);

        const utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {
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
    });

    test('UserTableGateway tiene operación para ver si existe el usuario', done => {
        const uuid = 'a0sdjv0nvoasdvenbkno123456789012';
        const name = 'Usuario 3';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        const utg = new UserTableGateway();
        utg.insertUser(user.uuid, user.name, user.hash, user.rol, () => {
            utg.userExists(user.name, function(err, exists) {
                expect(exists).toBeTruthy();
                done();
                return;
            });
        });
    });

    test('UserTableGateway tiene operación para ver si existe el usuario (cuando no existe)', done => {
        const uuid = 'klkadnvi3egn0awg0340fjwejf089012';
        const name = 'Usuario 4';
        const hash = 0x01;
        const user = new Client(uuid, name, hash);

        const utg = new UserTableGateway();
        utg.userExists(user.name, function(err, exists) {
            expect(exists).not.toBeTruthy();
            done();
            return;
        });
    });

    test('LocalTableGateway tiene operación para insertar Local', done => {
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

        const ltg = new LocalTableGateway();  
        ltg.insertVenue(local.uuid, local.name, local.hash, local.codigoPostal, local.logo, owner.uuid, function(err) {
            // Verificamos que se ha insertado el local correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('LocalTableGateway tiene operación para cargar todos los Locales', done => {
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

        const ltg = new LocalTableGateway();  
        ltg.insertVenue(local.uuid, local.name, local.hash, local.codigoPostal, local.logo, owner.uuid, () => {
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
    });

    test('ChatTableGateway tiene operación para insertar chat', done => {
        const ownerId = '12338677901224867893123359789012';
        const userId = '12325677931224562893123336789012';
        const reservaId = '12325277902224587493129356489010';
        const chatId = 'efifj4040402850gj20fj40gn20n9012';
        const chat = new Chat(chatId);

        const ctg = new ChatTableGateway();  
        ctg.insertChat(chatId, ownerId, userId, reservaId, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('ChatTableGateway tiene operación para recuperar Chat', done => {
        const mockChatFactory = function(callback, uuid) {
            let chat = new Chat(uuid);
            callback(chat);
        }
        ChatTableGateway.__set__({ chatFactory: mockChatFactory });

        const ownerId = '12338677901224867893123359789012';
        const userId = '12325677931224562893123336789012';
        const reservaId = 'asjodfjeojo20fj0wv3jojncn03f0201';
        const chatId = '3309f9asdjio3ogiwfme0gm40hn20384';
        const chat = new Chat(chatId);

        const ctg = new ChatTableGateway();
        ctg.insertChat(chat.uuid, ownerId, userId, reservaId, () => {
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
    });

    test('ChatTableGateway tiene operación para recuperar Chats asociados a dueño', done => {
        const mockChatFactory = function(callback, uuid) {
            let chat = new Chat(uuid);
            callback(chat);
        }
        ChatTableGateway.__set__({ chatFactory: mockChatFactory });

        const ownerId = '1233867730ja0v0n0n933jfa0j0anj12';
        const userId = '12879846519992592592529836789012';
        const reservaId = 'asjodfjeojo20789456123ncn03f0201';
        const chatId = '3321655498789498357e0gm40hn20384';
        const chat = new Chat(chatId);

        const ctg = new ChatTableGateway();
        ctg.insertChat(chat.uuid, ownerId, userId, reservaId, () => {
            ctg.loadChatIds(ownerId, function(err, loadedChats) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(loadedChats[0]).toBe(chat.uuid);
                    done();
                    return;
                }
            });
        });
    });

    test('ChatTableGateway tiene operación para recuperar el Id de la reserva asociada al chat', done => {
        const mockChatFactory = function(callback, uuid) {
            let chat = new Chat(uuid);
            callback(chat);
        }
        ChatTableGateway.__set__({ chatFactory: mockChatFactory });

        const ownerId = '12R30awjf0wvj033867730jafoadfjjj12';
        const userId = '128798465199920ajf0je0jfa6789012';
        const reservaId = 'asjodfjeojoJ30j0afjajf0ajfjf0201';
        const chatId = '33216530aj0fja0wej7e0gm40afj0aj4';
        const chat = new Chat(chatId);

        const ctg = new ChatTableGateway();
        ctg.insertChat(chat.uuid, ownerId, userId, reservaId, () => {
            ctg.getIdReserva(chatId, function(err, idReserva) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(idReserva).toBe(reservaId);
                    done();
                    return;
                }
            });
        });
    });
    
    test('ChatTableGateway tiene operación para ver si existe un Chat', done => {
        const mockChatFactory = function(callback, uuid) {
            let chat = new Chat(uuid);
            callback(chat);
        }
        ChatTableGateway.__set__({ chatFactory: mockChatFactory });

        const ownerId = '123386779012230faj0sjf0va9789012';
        const userId = '1232567730a0fja0v00bvn3336789012';
        const reservaId = 'asjo30ja0jwf0snv0b0avjncn03f0201';
        const chatId = '3309f9asdj30ja0jv0anv0n0ann20384';
        const chat = new Chat(chatId);

        const ctg = new ChatTableGateway();
        ctg.insertChat(chat.uuid, ownerId, userId, reservaId, () => {
            ctg.existsChat(reservaId, function(err, exists) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(exists).toBeTruthy();
                    done();
                    return;
                }
            });
        });
    });

    test('MessageTableGateway tiene operación para insertar mensaje', done => {
        const senderUuid = '12345678234234567890123456789013';
        const senderName = 'Message Sender 1';
        const senderHash = 0x02;
        const sender = new Owner(senderUuid, senderName, senderHash);

        const chatId = '34fjrj3480288050jf0j0j48th028hfn';
        const messageId = '123056779s122456789a12335w789-12';
        const texto = 'Mensaje de Prueba';
        const timestamp = null
        const message = new Mensaje(messageId, sender, texto, timestamp);

        const mtg = new MessageTableGateway();  
        mtg.insertMessage(message.uuid, message.texto, sender.uuid, chatId, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('MessageTableGateway tiene operación para cargar todos los Mensajes', done => {
        const senderUuid = '12345678234234567890123456789013';
        const senderName = 'Message Sender 1';
        const senderHash = 0x02;
        const sender = new Owner(senderUuid, senderName, senderHash);

        const chatId = '1232167700122436789l123356789012';
        const messageId = '12325677901224567893123356789012';
        const texto = 'Mensaje de Prueba';
        const timestamp = null
        const message = new Mensaje(messageId, sender, texto, timestamp);

        const mtg = new MessageTableGateway();  
        mtg.insertMessage(message.uuid, message.texto, sender.uuid, chatId, () => {
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
    });
    
    test('OfertaTableGateway tiene operación para insertar oferta', done => {
        const ownerId = '12325c779012i4567890123456789012';
        const localId = '42c2527790120456789j123456789012';
        const ofertaId = '9142-247901204567899123h56789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 1';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('OfertaTableGateway tiene operación para recuperar lista de ofertas', done => {
        const ownerId = '1232asdf2308f003fwefj03rewe0fjqf';
        const localId = '3asdfj30w02jfjs030ja0dfj30fjae0f';
        const ofertaId = '4ql3kekf039fjw03jt04j0ejf03j0402';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 2';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {
            otg.loadOfertas(ownerId, function(err, ofertasList) {
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

    test('OfertaTableGateway tiene operación para borrar una Oferta', done => {
        const ownerId = '1232asdf2308f003fwefj03rewe0fjqf';
        const localId = '3asdfj30w02jfjs030ja0dfj30fjae0f';
        const ofertaId = '4q3fjf302fj0vn20ng04j0ejf03j0402';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 3';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {
            otg.deleteOferta(oferta.uuid, function(err) {
                // Si todo va bien, err = null
                expect(err).toBeNull();

                done();
                return;
            });
        });
    });

    test('ReservaTableGateway tiene operación para insertar reserva', done => {
        const userId = '1R23fdsdcasvenn233r0fjwfnce0fn12';
        const ofertaId = '9142-247901204567899123h56789012';
        const reservaId = '38fji328fjio3208jfiojfnj32823fa2';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';
        const reserva = new Reserva(reservaId, hora, dia, telefono, ofertaId);

        const rtg = new ReservaTableGateway();  
        rtg.insertReserva(reserva.uuid, reserva.telefono, reserva.hora, reserva.dia, userId, reserva.idOferta, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('ReservaTableGateway tiene operación para recuperar lista de reservas', done => {
        const userId = '1R23fdsdcasv23n233r0fjwfnce0fn12';
        const ofertaId = '9142-247901204567899123h56789012';
        const reservaId = '38fji328f0ir3208jfiojfnj32823fa2';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';
        const reserva = new Reserva(reservaId, hora, dia, telefono, ofertaId);

        const rtg = new ReservaTableGateway();  
        rtg.insertReserva(reserva.uuid, reserva.telefono, reserva.hora, reserva.dia, userId, reserva.idOferta, () => {
            rtg.loadReservas(userId, function(err, reservasList) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(reservasList[0].uuid).toBe(reserva.uuid);
                    done();
                    return;
                }
            });
        });
    });

    test('ReservaTableGateway tiene operación para recuperar Id del usuario que la realizó', done => {
        const userId = '1R23fdsdcasv23n233r398v8nvs0fn12';
        const ofertaId = '9142-247901204567899123h84915412';
        const reservaId = '38fji789459987466184591j32823fa2';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';
        const reserva = new Reserva(reservaId, hora, dia, telefono, ofertaId);

        const rtg = new ReservaTableGateway();  
        rtg.insertReserva(reserva.uuid, reserva.telefono, reserva.hora, reserva.dia, userId, reserva.idOferta, () => {
            rtg.getIdUsuario(reservaId, function(err, idUsuario) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(idUsuario).toBe(userId);
                    done();
                    return;
                }
            });
        });
    });

    test('ReservaTableGateway tiene operación para recuperar el ID de la Oferta Asociada', done => {
        const userId = '1R23fdsdcasv23n233r0fjwfnce0fn12';
        const ofertaId = 'fj20jf023fj02jf02jf03j0gn320gn12';
        const reservaId = '038fj02nv02m040hm20f0hnj32823fa2';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';
        const reserva = new Reserva(reservaId, hora, dia, telefono, ofertaId);

        const rtg = new ReservaTableGateway();  
        rtg.insertReserva(reserva.uuid, reserva.telefono, reserva.hora, reserva.dia, userId, reserva.idOferta, () => {
            rtg.getIdOferta(reserva.uuid, function(err, idOferta) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(idOferta).toBe(ofertaId);
                    done();
                    return;
                }
            });
        });
    });

    test('ResennaTableGateway tiene operación para insertar Reseña', done => {
        const userId = '1R23fdsdcasvenn233r0fjwfnce0fn12';
        const ofertaId = '9142-247901r04567899123h56789012';
        const resennaId = 'f23fj023fj0nb2f000fi30g4n40g02n0';
        const descripcion = 'Reseña de Prueba';
        const resenna = new Resenna(resennaId, descripcion);

        const rtg = new ResennaTableGateway();  
        rtg.insertResenna(resenna.uuid, resenna.descripcion, userId, ofertaId, function(err) {
            // Verificamos que se ha insertado el usuario correctamente
            expect(err).toBeNull();
            
            done();
            return;
        });
    });

    test('ResennaTableGateway tiene operación para recuperar lista de Reseñas', done => {
        const userId = '1R23fdsdcasvenn233r0fjwfnce0fn12';
        const ofertaId = '9142-247901204567899123h56789012';
        const resennaId = '30feor230jfen32800fi30g4n40g02n0';
        const descripcion = 'Reseña de Prueba 2';
        const resenna = new Resenna(resennaId, descripcion);

        const rtg = new ResennaTableGateway();  
        rtg.insertResenna(resenna.uuid, resenna.descripcion, userId, ofertaId, () => {
            rtg.loadResennas(ofertaId, function(err, resennasList) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(resennasList[0].uuid).toBe(resenna.uuid);
                    done();
                    return;
                }
            });
        });
    });

    test('ResennaTableGateway tiene operación para borrar una reseña', done => {
        const userId = '1R23fdsdcasvenn233r0fjwfnce0fn12';
        const ofertaId = '9142-247901204567899123h56789012';
        const resennaId = 'fasfae230jfen32800fi30g4n40g02n0';
        const descripcion = 'Reseña de Prueba 3';
        const resenna = new Resenna(resennaId, descripcion);

        const rtg = new ResennaTableGateway();  
        rtg.insertResenna(resenna.uuid, resenna.descripcion, userId, ofertaId, () => {
            rtg.deleteResenna(resenna.uuid, function(err) {
                // Si todo va bien, err = null
                expect(err).toBeNull();

                done();
                return;
            });
        });
    });
    
    test('ResennaTableGateway borra las reseñas', done => {
        const userId = '1R23fdsdcasvenn233r0fjwfnce0fn12';
        const ofertaId = 'fajsd0f0ng03f0m30gn9123h56789012';
        const resennaId = '3fja0f03ng043nh034m0wcyc0c9t0ux5';
        const descripcion = 'Reseña de Prueba 4';
        const resenna = new Resenna(resennaId, descripcion);

        const rtg = new ResennaTableGateway();  
        rtg.insertResenna(resenna.uuid, resenna.descripcion, userId, ofertaId, () => {
            rtg.deleteResenna(resenna.uuid, function(err) {
                // Si todo va bien, err = null
                rtg.loadResennas(ofertaId, function(err, listaResennas) {
                    expect(listaResennas).toEqual([]);

                    done();
                    return;
                });
            });
        });
    });
    
    test('ReservaTableGateway tiene operación para borrar una reserva', done => {
        const userId = '1R23fdsdcasvenn233r0fjwfnce0fn12';
        const ofertaId = '9142-247901204567899123h56789012';
        const reservaId = 'jf0jfwe0gg340jt023jf02j30fj230jt';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';
        const reserva = new Reserva(reservaId, hora, dia, telefono, ofertaId);

        const rtg = new ReservaTableGateway();  
        rtg.insertReserva(reserva.uuid, reserva.telefono, reserva.hora, reserva.dia, userId, reserva.idOferta, () => {
            rtg.deleteReserva(reserva.uuid, function(err) {
                // Si todo va bien, err = null
                expect(err).toBeNull();

                done();
                return;
            });
        });
    });

    test('OfertaTableGateway tiene operación para actualizar oferta', done => {
        const ownerId = '300jf0fajs0gn04gn090123456789012';
        const localId = '300aj0j0asdv0n0en0ganb0ae0nc4gn2';
        const ofertaId = '3908faj0j0n0n0qh4ht9haf98h9ad012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 13.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 1';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {});

        const newPrice = 11.9;
        otg.updateOferta(oferta.uuid, newPrice, oferta.descripcion, oferta.foto, oferta.activa, function(err) {
            otg.loadOfertas(ownerId, function(err, listaOfertas) {
                expect(listaOfertas[0].precio).toBe(newPrice);

                done();
                return;
            });
        });
    });

    test('LocalTableGateway tiene operación para actualizar local', done => {
        const ownerUuid = 'afj03j0faj3044567890123456789013';
        const name = 'Owner Prueba Local Update';
        const hash = 0x01;
        const owner = new Owner(ownerUuid, name, hash);

        const venueUuid = '230fj20wmms0404nfw0';
        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'
        const local = new Local(venueUuid, nombre, calle, codigoPostal, logo);

        const ltg = new LocalTableGateway();
        ltg.insertVenue(local.uuid, local.nombre, local.calle, local.codigoPostal, local.logo, owner.uuid, function(err) {
            const newCalle = 'calle mips 43';
            ltg.updateVenue(local.uuid, local.nombre, newCalle, local.codigoPostal, local.logo, function(err) {
                ltg.loadVenues(owner.uuid, function(err, listaLocales) {
                    expect(listaLocales[0].calle).toBe(newCalle);

                    done();
                    return;
                });
            });
        });
    });

    test('LocalTableGateway tiene operación para borrar Local', done => {
        const ownerUuid = '230fjw5868720g0q3n0v3qn456789013';
        const name = 'Owner 1';
        const hash = 0x01;
        const owner = new Owner(ownerUuid, name, hash);

        const venueUuid = '20fj0w0';
        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'
        const local = new Local(venueUuid, nombre, calle, codigoPostal, logo);

        const ltg = new LocalTableGateway();  
        ltg.insertVenue(local.uuid, local.nombre, local.calle, local.codigoPostal, local.logo, owner.uuid, function(err) {
            ltg.deleteVenue(local.uuid, function(err) {
                ltg.loadVenues(owner.uuid, function(err, venueList) {
                   expect(venueList).toEqual([]);
                   
                   done();
                   return;
                });
            });
        });
    });

    test('OfertaTableGateway tiene operación para recuperar todas las ofertas Activas', done => {
        const ownerId = '30jf0sj03n0vsn0n0gn0j03rewe0fjqf';
        const localId = '3asdfj30w02jfjs030ja0dfj30fjae0f';
        const ofertaId = '3020d0jjanvn00n0nw0n30ejf03j0402';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 2';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {
            otg.loadAllActiveOfertas(function(err, ofertasList) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(ofertasList).toContainEqual(oferta);
                    done();
                    return;
                }
            });
        });
    });
    
    test('LocalTableGateway tiene operación para cargar un local específico', done => {
        const ownerUuid = '30jfjanlen3o3ios7890123456789013';
        const name = 'Owner 1';
        const hash = 0x02;
        const owner = new Owner(ownerUuid, name, hash);

        const venueUuid = 'fj0asdj03';
        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'
        const local = new Local(venueUuid, nombre, calle, codigoPostal, logo);

        const ltg = new LocalTableGateway();  
        ltg.insertVenue(local.uuid, local.name, local.hash, local.codigoPostal, local.logo, owner.uuid, () => {
            ltg.loadVenue(local.uuid, function(err, venue) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(venue.uuid).toBe(local.uuid);
                    done();
                    return;
                }
            });
        });
    });

    test('LocalTableGateway tiene operación para cargar todos los locales', done => {
        const ownerUuid = '300ufijoi4oijglwj890123456789013';
        const name = 'Owner 1';
        const hash = 0x02;
        const owner = new Owner(ownerUuid, name, hash);

        const venueUuid = '901804803';
        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'
        const local = new Local(venueUuid, nombre, calle, codigoPostal, logo);

        const ltg = new LocalTableGateway();  
        ltg.insertVenue(local.uuid, local.nombre, local.calle, local.codigoPostal, local.logo, owner.uuid, () => {
            ltg.loadAllVenues(function(err, venueList) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(venueList).toContainEqual(local);
                    done();
                    return;
                }
            });
        });
    });
    
    test('OfertaTableGateway tiene operación para recuperar todas las ofertas asociadas a un local', done => {
        const ownerId = '4802f002bv02n0jc02n0j03rewe0fjqf';
        const localId = '329020ffq0w40h0t4hg0wnf02nv0230bg';
        const ofertaId = '48028r01f0n03g02nf02n0h0';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 2';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {
            otg.loadOfertasLocal(localId, function(err, ofertasList) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(ofertasList).toContainEqual(oferta);
                    done();
                    return;
                }
            });
        });
    });
    
    test('OfertaTableGateway tiene operación para recuperar una oferta a partir de su Id', done => {
        const ownerId = '4802f002bv02n0jc30f0jf0j0jd0fjqf';
        const localId = '329020ffq30f0sja0je0jf032nv0230bg';
        const ofertaId = '48028r0130fsa0j0j0g2n0h0';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba X';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {
            otg.loadOferta(ofertaId, function(err, ofertaCargada) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(ofertaCargada.uuid).toEqual(oferta.uuid);
                    done();
                    return;
                }
            });
        });
    });
    
    test('OfertaTableGateway tiene operación para recuperar el Id del local asociado a una oferta', done => {
        const ownerId = '4390fj0ajf00bn40nfw0jf0j0jd0fjqf';
        const localId = '329020ffq30300ajf0j0n0na0nv0230bg';
        const ofertaId = '48028r0390ajf0j30:w3a0fh';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba X';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {
            otg.getIdLocal(ofertaId, function(err, idLocal) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(idLocal).toEqual(localId);
                    done();
                    return;
                }
            });
        });
    });
    
    test('OfertaTableGateway tiene operación para recuperar el Id del dueño asociado a una oferta', done => {
        const ownerId = '4390fj0ajf00bn40nf30jfafj0env0nf';
        const localId = '329020ffq30300ajf30ajf0ja0vn0n0bg';
        const ofertaId = '48028r039ajf0ajv0an0n0fh';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba Y';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();  
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {
            otg.getIdOwner(ofertaId, function(err, idOwner) {
                if (err) {
                    done(err);
                    return;
                } else {
                    expect(idOwner).toEqual(ownerId);
                    done();
                    return;
                }
            });
        });
    });
});