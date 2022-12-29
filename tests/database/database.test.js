const sqlite3  = require('sqlite3');
const rewire = require('rewire');
const fs = require('fs');
const path = require('path');
const { User } = require('../../model/usuarios');

const database = rewire('../../database/database');
    
const Client = require('../../model/usuarios').Client;

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
    beforeEach(() => {
        const db = new sqlite3.Database(':memory:', function(err) {
            const sqlCreationScript = fs.readFileSync(
                path.join(__dirname, '..', '..', 'database', 'creation_script.sql')
            );
            const statementArray = sqlCreationScript.toString().split(';');
    
            db.serialize(() => {
                statementArray.forEach((statement) => {
                    statement += ';';           // Volvemos a añadir el ; al final del statement
                    db.run(statement);
                });
            });
        });
        
        database.__set__({ db: db });
    });

    afterEach(() => {
        database.__get__('db').close();
    })

    test('UserTableGateway tiene operación para insertar usuario', done => {
        const db = database.__get__('db');
        const UserTableGateway = database.UserTableGateway;

        const uuid = '12345678901234567890123456789012';
        const name = 'Nombre';
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

        const uuid = '12345678901234567890123456789012';
        const name = 'Nombre';
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
});