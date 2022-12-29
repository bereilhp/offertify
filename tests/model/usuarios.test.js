const usuarios = require('../../model/usuarios');
const User = usuarios.User;
const Client = usuarios.Client;
const Owner = usuarios.Owner;
const Admin = usuarios.Admin;
const userFactory = usuarios.userFactory;

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

test('Clase Client tiene rol user', () => {
    cliente = new Client('uuid-prueba', 'Nombre', 0x01);
    expect(cliente.rol).toBe('user');
});

test('Clase Owner tiene rol owner', () => {
    owner = new Owner('uuid-prueba', 'Nombre', 0x01);
    expect(owner.rol).toBe('owner');
});

test('Clase Admin tiene rol admin', () => {
    admin = new Admin('uuid-prueba', 'Nombre', 0x01);
    expect(admin.rol).toBe('admin');
});

test('userFactory() crea Clientes para Rol = user', () => {
    cliente = userFactory('Nombre', 0x01, 'user');
    expect(cliente).toBeInstanceOf(Client);
});

test('userFactory() crea uuids diferentes para cada usuario', () => {
    user_1 = userFactory('Usuario 1', 0x01, 'user');
    user_2 = userFactory('Usuario 2', 0x02, 'admin');
    expect(user_1.uuid).not.toEqual(user_2.uuid);
});