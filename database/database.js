const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.db');

let db = new sqlite3.Database(DB_PATH, () => {});

module.exports = { 
    db
}