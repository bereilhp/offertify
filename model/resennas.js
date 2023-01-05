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
 * @param {string | null} resennaId Opcional. UUID de la reseña. Si no se especifica, se genera uno nuevo

 * @returns Un objeto resenna con los datos proporcionados
 */
function resennaFactory(descripcion, resennaId = null) {
    resennaId = resennaId ?? uuid.v4();
    return new Resenna(resennaId,descripcion);
}

module.exports = {
    Resenna,
    resennaFactory
}