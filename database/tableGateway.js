const { db } = require('./database');

const TableGateway = class TableGateway {
    /**
     * Método para ejecutar una sentencia `INSERT`, `UPDATE` o `DELETE`.
     * 
     * @param {string} statement Sentencia SQL a ejecutar. Puede ser `INSERT`, `UPDATE` o `DELETE`
     * @param {function(any | null)} callback Callback ejecutado al finalizar la operación. Devuelve `null` si todo va bien,
     * un error en caso contrario 
     */
    run(statement, callback) {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            db.run(statement, function(err) {
                if (err) {
                    console.log(err);
                }
            });
            db.run('COMMIT;', function(err) {
                callback(null);
            });
        });
    }

    /**
     * Función que ejecuta una consulta SQL y devuelve un objeto creado según la `factory` indicada.
     * 
     * @param {string} statement Sentencia SQL a ejecutar.
     * @param {function(Object):Object} factory Función que toma como parámetro las filas individuales (`row`) y crea
     * un objeto con los campos necesarios.
     * @param {function(any | null, Object | null)} callback Callback a ejecutar una vez finalizada la sentencia. 
     * Toma como parámetros el objeto `row` recuperado y el error ocurrido (`null` si no hay).
     */
    get(statement, factory, callback) {
        this.all(statement, factory, function(err, resultList) {
            const result = resultList[0];
            callback(err, result);
        });
    }

    /**
     * Función que ejecuta una consulta SQL y devuelve una lista de objetos creados utilizando la `factory` indicada.
     * 
     * @param {string} statement Sentencia SQL a ejecutar.
     * @param {function(Object):Object} factory Función que toma como parámetro las filas individuales (`row`) y crea
     * un objeto con los campos necesarios.
     * @param {function(any | null, array<Object> | null)} callback Callback a ejecutar una vez finalizada la sentencia. 
     * Toma como parámetros la lista de filas ecuperada y el error ocurrido (`null` si no hay).
     */
    all(statement, factory, callback) {
        db.serialize(() => {
            db.all(statement, function(err, rows) {
                if (err) {
                    callback(err, null);
                } else {
                    let resultList = [];
                    rows.forEach((row) => {
                        let obj = factory(row);
                        resultList.push(obj);
                    });
                    callback(null, resultList);
                }
            });
        });
    }
}

module.exports = TableGateway;