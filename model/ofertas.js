const uuid = require('uuid');

const Oferta = class Oferta {
    constructor(uuid, foto, precio, activa, descripcion) {
       this.uuid = uuid;
       this.foto = foto;
       this.precio = precio;
       this.activa = activa; 
       this.descripcion = descripcion
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
function ofertaFactory(foto, precio, activa, descripcion, localId = null) {
    localId = localId ?? uuid.v4();
    return new Oferta(localId, foto, precio, activa,descripcion);
}

module.exports = {
    Oferta,
    ofertaFactory
}