const locales = require('../../model/locales');
const Local = locales.Local;
const localFactory = locales.localFactory;

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

test('localFactory() crea Locales', () => {
    const local = localFactory('Nombre', 'Calle Ensamblador 15', 12345);
    expect(local).toBeInstanceOf(Local);
});

test('localFactory() crea uuids diferentes para cada local', () => {
    const local_1 = localFactory('Nombre', 'Calle Ensamblador 15', 12345);
    const local_2 = localFactory('Nombre', 'Calle MIPS 23', 45821);
    expect(local_1.uuid).not.toEqual(local_2.uuid);
});    

test('localFactory() crea uuid sólo si no se especifica', () => {
    const local = localFactory('Nombre', 'Calle Ensamblador 15', 12345, 'id');
    expect(local.uuid).toBe('id');
});