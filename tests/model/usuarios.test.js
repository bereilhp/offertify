const usuarios = require('../../model/usuarios');
const User = usuarios.User;
const Client = usuarios.Client;
const Owner = usuarios.Owner;
const Admin = usuarios.Admin;
const userFactory = usuarios.userFactory;

test('Clase User almacena UUID', () => {
    const user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.uuid).toEqual('uuid-prueba');
});

test('Clase User almacena hash', () => {
    const user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.hash).toEqual(0x01);
});

test('Clase User almacena Nombre', () => {
    const user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.name).toEqual('Nombre');
});

test('Clase User almacena rol como undefined', () => {
    const user = new User('uuid-prueba', 'Nombre', 0x01);
    expect(user.rol).toBeUndefined();
});

test('Clase Client es hija de User', () => {
    const cliente = new Client('uuid-prueba', 'Nombre', 0x01);
    expect(cliente).toBeInstanceOf(User);
});

test('Clase Owner es hija de User', () => {
    const owner = new Owner('uuid-prueba', 'Nombre', 0x01);
    expect(owner).toBeInstanceOf(User);
});

test('Clase Admin es hija de User', () => {
    const admin = new Admin('uuid-prueba', 'Nombre', 0x01);
    expect(admin).toBeInstanceOf(User);
});

test('Clase Client tiene rol user', () => {
    const cliente = new Client('uuid-prueba', 'Nombre', 0x01);
    expect(cliente.rol).toBe('user');
});

test('Clase Owner tiene rol owner', () => {
    const owner = new Owner('uuid-prueba', 'Nombre', 0x01);
    expect(owner.rol).toBe('owner');
});

test('Clase Admin tiene rol admin', () => {
    const admin = new Admin('uuid-prueba', 'Nombre', 0x01);
    expect(admin.rol).toBe('admin');
});

test('userFactory() crea Clientes para Rol = user', () => {
    const cliente = userFactory('Nombre', 0x01, 'user');
    expect(cliente).toBeInstanceOf(Client);
});

test('userFactory() crea uuids diferentes para cada usuario', () => {
    const user_1 = userFactory('Usuario 1', 0x01, 'user');
    const user_2 = userFactory('Usuario 2', 0x02, 'admin');
    expect(user_1.uuid).not.toEqual(user_2.uuid);
});

test('userFactory() crea Dueños para Rol = owner', () => {
    const owner = userFactory('Nombre', 0x01, 'owner');
    expect(owner).toBeInstanceOf(Owner);
});

test('userFactory() crea Admins para Rol = admin', () => {
    const owner = userFactory('Nombre', 0x01, 'owner');
    expect(owner).toBeInstanceOf(Owner);
});

test('userFactory() devuelve null si el rol no es válido', () => {
    const user = userFactory('Nombre', 0x01, 'Infiltrado');
    expect(user).toBeNull();
});

test('userFactory() crea uuid sólo si no se especifica', () => {
    const uuid = 'id';
    const user = userFactory('Nombre', 0x01, 'user', uuid);
    expect(user.uuid).toBe('id');
})