const usuarios = require('../../model/usuarios');
const User = usuarios.User

test('Objeto User almacena UUID', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.uuid).toEqual('uuid-prueba');
});

test('Objeto User almacena hash', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.hash).toEqual(0x01);
});

test('Objeto User almacena Nombre', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.name).toEqual('Nombre');
});

test('Objeto User almacena rol como undefined', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.rol).toBeUndefined();
});