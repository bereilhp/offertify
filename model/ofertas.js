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
 * 
 * @param {Blob} foto foto de la oferta
 * @param {int} precio precio de la oferta es de tipo numero
 * @param {BinaryData} activa 0 o 1 si la oferta esa activa o no
 * @param {string} descripcion Pequena descripcion del la oferta 
 * @param {string | null} ofertaId Opcional. UUID del la oferta. Si no se especifica, se genera uno nuevo
 * @returns Objeto oferta con los datos proporcionados
 */
function ofertaFactory(foto, precio, activa, descripcion, ofertaId = null) {
    ofertaId = ofertaId ?? uuid.v4();
    return new Oferta(ofertaId, foto, precio, activa,descripcion);
}

module.exports = {
    Oferta,
    ofertaFactory
}