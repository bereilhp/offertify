const sqlite3  = require('sqlite3');
const rewire = require('rewire');
const database = rewire('../../database/database');


test('Módulo database se conecta a base de datos', () => {
    const db = database.__get__('db');
    expect(db).toBeInstanceOf(sqlite3.Database);
});

