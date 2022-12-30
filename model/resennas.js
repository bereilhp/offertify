const uuid = require('uuid');

const Resenna = class Resenna {
    constructor(uuid, descripcion) {
       this.uuid = uuid;
       this.descripcion = descripcion
    }
}

/**
 * 
 * @param {string} descripcion 
 * @param {string | null} localId Opcional. UUID de la reseña. Si no se especifica, se genera uno nuevo

 * @returns Un objeto resenna con los datos proporcionados
 */
function resennaFactory(descripcion, localId = null) {
    localId = localId ?? uuid.v4();
    return new Resenna(localId,descripcion);
}

module.exports = {
    Resenna,
    resennaFactory
}