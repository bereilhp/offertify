const bcrypt = require('bcrypt');
const { Console } = require('console');
const rewire = require('rewire');
const { Oferta } = require('../../model/ofertas');
const { Resenna } = require('../../model/resennas');
const { Reserva } = require('../../model/reservas');

const usuarios = rewire('../../model/usuarios');
const User = usuarios.User;
const Client = usuarios.Client;
const Owner = usuarios.Owner;
const Admin = usuarios.Admin;
const userFactory = usuarios.userFactory;
const registerUser = usuarios.registerUser;

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

test('Clase Client tiene lista de Reservas', () => {
    const cliente = new Client('uuid-prueba', 'Nombre', 0x01);
    expect(cliente.reservas).toEqual([]);
});

test('Clase Client guarda las Reservas', () => {
    const cliente = new Client('uuid-prueba', 'Nombre', 0x01, ['jaja']);
    expect(cliente.reservas).toEqual(['jaja']);
});

test('Clase Client tiene lista de Reseñas', () => {
    const cliente = new Client('uuid-prueba', 'Nombre', 0x01);
    expect(cliente.resennas).toEqual([]);
});

test('Clase Client guarda las Reseñas', () => {
    const cliente = new Client('uuid-prueba', 'Nombre', 0x01, [], ['Reseña']);
    expect(cliente.resennas).toEqual(['Reseña']);
});

test('Clase Owner tiene rol owner', () => {
    const owner = new Owner('uuid-prueba', 'Nombre', 0x01);
    expect(owner.rol).toBe('owner');
});

test('Clase Admin tiene rol admin', () => {
    const admin = new Admin('uuid-prueba', 'Nombre', 0x01);
    expect(admin.rol).toBe('admin');
});

test('Clase Owner tiene lista de ofertas', () => {
    const owner = new Owner('uuid-prueba', 'Nombre', 0x01);
    expect(owner.ofertas).toEqual([]);
});

test('Clase Owner tiene lista de locales', () => {
    const owner = new Owner('uuid-prueba', 'Nombre', 0x01);
    expect(owner.locales).toEqual([]);
});


test('Constructor de Owner toma opcionalmente lista de ofertas', () => {
    const owner = new Owner('uuid-prueba', 'Nombre', 0x01, ['blibli']);
    expect(owner.ofertas).toEqual(['blibli']);
});

test('Constructor de Owner toma opcionalmente lista de locales', () => {
    const owner = new Owner('uuid-prueba', 'Nombre', 0x01, [], ['blabla']);
    expect(owner.locales).toEqual(['blabla']);
});

describe('Tests que requieren Mock de BBDD', () => {
    const sqlite3 = require('sqlite3');
    const fs = require('fs');
    const path = require('path');
    const database = rewire('../../database/database');

    // Antes de todos los tests, se sustituye la BBDD original por una BBDD en memoria
    beforeAll(() => {
        const db = new sqlite3.Database(':memory:', function(err) {
            const sqlCreationScript = fs.readFileSync(
                path.join(__dirname, '..', '..', 'database', 'creation_script.sql')
            );
            const statementArray = sqlCreationScript.toString().split(';');
    
            db.serialize(() => {
                statementArray.forEach((statement) => {
                    // NOTA -> Al separar por ;, la última posición del array es un espacio en blanco.
                    //         Sqlite interpreta esto como un error y hace que fallen los tests
                    if (statement !== statementArray[statementArray.length - 1] ) {
                        statement += ';';           // Volvemos a añadir el ; al final del statement
                        db.run(statement);
                    }
                });
            });
        });
        
        database.__set__({ db: db });
    });

    afterAll(() => {
        database.__get__('db').close();
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
    });

    test('registerUser() haseha la contraseña y crea un usuario', () => {
        const UserTableGateway = database.UserTableGateway;
        usuarios.__set__({ UserTableGateway: UserTableGateway });
        const name = 'Usuario';
        const password = '1234';
        const rol = 'admin';

        registerUser(name, password, rol, function(err, user) {
            bcrypt.compare(password, user.hash, function(err, result) {
                expect(result).toBeTruthy();
            });
        });
    });

    test('registerUser() guarda el usuario en la BBDD', done => {
        const UserTableGateway = database.UserTableGateway;
        usuarios.__set__({ UserTableGateway: UserTableGateway });
        const name = 'Usuario Nuevo';
        const password = '1234';
        const rol = 'admin';

        registerUser(name, password, rol, function(err, user) {
            const utg = new UserTableGateway();
            utg.loadUser(name, function(err, readUser) {
                expect(readUser.uuid).toEqual(user.uuid);

                done();
                return;
            });
        });
    });

    test('Admin -> Método para borrar ofertas de la Base de Datos', done => {
        const OfertaTableGateway = database.OfertaTableGateway;
        usuarios.__set__({ OfertaTableGateway: OfertaTableGateway });
        const admin = new Admin('uuid-prueba', 'Admin Prueba', 0x01);
        
        const ownerId = '12325c779012i4567890123456789012';
        const localId = '42c2527790120456789j123456789012';
        const ofertaId = '23fj0jf02n0204567899123h56789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const activa = 1;
        const descripcion = 'Oferta de Prueba 1';
        const oferta = new Oferta(ofertaId, foto, precio, activa, descripcion);

        const otg = new OfertaTableGateway();
        otg.insertOferta(oferta.uuid, oferta.precio, oferta.descripcion, oferta.foto, oferta.activa, ownerId, localId, () => {});

        admin.borrarOferta(oferta.uuid, function(err) {
            otg.loadOfertas(ownerId, function(err, listaOfertas) {
                expect(listaOfertas).toEqual([]);

                done();
                return;
            });
        });
    });

    test('Admin -> Método para borrar Reseñas de la Base de Datos', done => {
        const ResennaTableGateway = database.ResennaTableGateway;
        usuarios.__set__({ ResennaTableGateway: ResennaTableGateway });

        const admin = new Admin('uuid-prueba', 'Admin Prueba', 0x01);

        const userId = '1R23fdsdcasvenn233r0fjwfnce0fn12';
        const ofertaId = '23r2r34fweja0sdf034ng03wner0f012';
        const resennaId = '3fj03jf0j30en32800fi30g4n40g02n0';
        const descripcion = 'Reseña de Prueba';
        const resenna = new Resenna(resennaId, descripcion);

        const rtg = new ResennaTableGateway();  
        rtg.insertResenna(resenna.uuid, resenna.descripcion, userId, ofertaId, () => {});
        
        admin.borrarResenna(resenna.uuid, function(err) {
            expect(err).toBeNull();

            done();
            return;
        });
    });

    test('Client -> Cliente puede crear reseñas que se guardan en la base de datos', done => {
        const ResennaTableGateway = database.ResennaTableGateway;
        const ReservaTableGateway = database.ReservaTableGateway;
        usuarios.__set__({
            ResennaTableGateway: ResennaTableGateway,
            ReservaTableGateway: ReservaTableGateway
        });
        
        const user = new Client('0fj20fj203n', 'Cliente Prueba para Reseñas 1', 0x01);

        const ofertaId = '080480fj20f02m30j02802380t82u0fj';
        const reservaId = 'fjw0fj023jf040gj0j30tfq302823fa2';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';
        const reserva = new Reserva(reservaId, hora, dia, telefono, ofertaId);
        const reservaGateway = new ReservaTableGateway();
        reservaGateway.insertReserva(reserva.uuid, reserva.telefono, reserva.hora, reserva.dia, user.uuid, reserva.idOferta, function(err) {
            user.hacerResenna('Me han estafado', reserva.uuid, function(resenna) {
                const rtg = new ResennaTableGateway();  
                rtg.loadResennas(ofertaId, function(err, listaResennas) {
                    expect(listaResennas[0].uuid).toBe(resenna.uuid);

                    done();
                    return;
                });
            });
        });
    });
});