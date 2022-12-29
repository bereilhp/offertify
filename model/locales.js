const Local = class Local {
    constructor(uuid, nombre, calle, codigoPostal) {
       this.uuid = uuid;
       this.nombre = nombre;
       this.calle = calle;
       this.codigoPostal = codigoPostal; 
    }
}

module.exports = {
    Local
}