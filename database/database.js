const sqlite3 = require('sqlite3');
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), () => {
    console.log("Conectado a BBDD");
});

module.exports = { }