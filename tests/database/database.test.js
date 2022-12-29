const sqlite3  = require('sqlite3');
const rewire = require('rewire');
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
