const locales = require('../../model/locales');
const Local = locales.Local;
const localFactory = locales.localFactory;

test('Local tiene uuid', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const logo = 0b01;
    const local = new Local(uuid, nombre, calle, codigoPostal,logo);
    expect(local.uuid).toBe(uuid);
});

test('Local tiene nombre', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const logo = 0b01;
    const local = new Local(uuid, nombre, calle, codigoPostal,logo);
    expect(local.nombre).toBe(nombre);
});

test('Local tiene calle', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const logo = 0b01;
    const local = new Local(uuid, nombre, calle, codigoPostal,logo);
    expect(local.calle).toBe(calle);
});

test('Local tiene codigo postal', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const logo = 0b01;
    const local = new Local(uuid, nombre, calle, codigoPostal, logo);
    expect(local.codigoPostal).toBe(codigoPostal);
});

test('Local tiene foto', () => {
    const uuid = 'id';
    const nombre = 'Local';
    const calle = 'Calle Ensamblador 15';
    const codigoPostal = 29078;
    const logo = 0b01;
    const local = new Local(uuid, nombre, calle, codigoPostal, logo);
    expect(local.logo).toBe(logo)
});

test('localFactory() crea Locales', () => {
    const local = localFactory('Nombre', 'Calle Ensamblador 15', 12345, 0b01);
    expect(local).toBeInstanceOf(Local);
});

test('localFactory() crea uuids diferentes para cada local', () => {
    const local_1 = localFactory('Nombre', 'Calle Ensamblador 15', 12345,0b01);
    const local_2 = localFactory('Nombre', 'Calle MIPS 23', 45821,0b01);
    expect(local_1.uuid).not.toEqual(local_2.uuid);
});    

test('localFactory() crea uuid sólo si no se especifica', () => {
    const local = localFactory('Nombre', 'Calle Ensamblador 15', 12345, 0b01, 'id');
    expect(local.uuid).toBe('id');
});