const uuid = require('uuid');

const Local = class Local {
    constructor(uuid, nombre, calle, codigoPostal, logo) {
       this.uuid = uuid;
       this.nombre = nombre;
       this.calle = calle;
       this.codigoPostal = codigoPostal; 
       this.logo = logo
    }
}

/**
 * Función para crear locales.
 *  
 * @param {string} nombre Nombre del local
 * @param {string} calle Calle en la que se ubica el local
 * @param {int} codigoPostal Código postal del local
 * @param {string | null} localId Opcional. UUID del local. Si no se especifica, se genera uno nuevo
 * @returns Un objeto local con los datos proporcionados
 */
function localFactory(nombre, calle, codigoPostal,logo, localId = null) {
    localId = localId ?? uuid.v4();
    return new Local(localId, nombre, calle, codigoPostal,logo);
}

module.exports = {
    Local,
    localFactory
}