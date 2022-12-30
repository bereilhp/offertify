const uuid = require('uuid');

const Resenna = class Resenna {
    constructor(uuid, descripcion) {
       this.uuid = uuid;
       this.descripcion = descripcion
    }
}


function resennaFactory(descripcion, localId = null) {
    localId = localId ?? uuid.v4();
    return new Oferta(localId,descripcion);
}

module.exports = {
    Resenna,
    resennaFactory
}