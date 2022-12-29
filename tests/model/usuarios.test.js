const usuarios = require('../../model/usuarios');
const User = usuarios.User;
const Client = usuarios.Client;
const Owner = usuarios.Owner;
const Admin = usuarios.Admin;

test('Clase User almacena UUID', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.uuid).toEqual('uuid-prueba');
});

test('Clase User almacena hash', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.hash).toEqual(0x01);
});

test('Clase User almacena Nombre', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.name).toEqual('Nombre');
});

test('Clase User almacena rol como undefined', () => {
    user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.rol).toBeUndefined();
});

test('Clase Client es hija de User', () => {
    cliente = new Client('uuid-prueba', 'Nombre', 0x01);
    expect(cliente).toBeInstanceOf(User);
});

test('Clase Owner es hija de User', () => {
    owner = new Owner('uuid-prueba', 'Nombre', 0x01);
    expect(owner).toBeInstanceOf(User);
});

test('Clase Admin es hija de User', () => {
    admin = new Admin('uuid-prueba', 'Nombre', 0x01);
    expect(admin).toBeInstanceOf(User);
});