const locales = require('../../model/locales');
const Local = locales.Local;

test('Local tiene uuid', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const local = new Local(uuid, nombre, calle, codigoPostal);
    expect(local.uuid).toBe(uuid);
});

test('Local tiene nombre', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const local = new Local(uuid, nombre, calle, codigoPostal);
    expect(local.nombre).toBe(nombre);
});

test('Local tiene calle', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const local = new Local(uuid, nombre, calle, codigoPostal);
    expect(local.calle).toBe(calle);
});

test('Local tiene codigo postal', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const local = new Local(uuid, nombre, calle, codigoPostal);
    expect(local.codigoPostal).toBe(codigoPostal);
});