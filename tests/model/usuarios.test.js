const bcrypt = require('bcrypt');
const { Console } = require('console');
const rewire = require('rewire');
const { OfertaTableGateway } = require('../../database/database');
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

    test('Client -> Cliente puede crear reservas', done => {
        const user = new Client('if3fjwe0cqw', 'Cliente Prueba para Reservas 1', 0x01);

        const ofertaId = '080480fj20f02m30j02802380t82u0fj';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';

        user.hacerReserva(ofertaId, telefono, hora, dia, function(reserva) {
            expect(reserva.idOferta).toBe(ofertaId);

            done();
            return;
        });
    });

    test('Client -> Las reservas creadas por el cliente se guardan en Base de Datos', done => {
        const ReservaTableGateway = database.ReservaTableGateway;
        usuarios.__set__({ ReservaTableGateway: ReservaTableGateway });
        
        const user = new Client('23fj0scneno', 'Cliente Prueba para Reservas 2', 0x01);

        const ofertaId = '080480fj20f02m30j02802380t82u0fj';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';

        user.hacerReserva(ofertaId, telefono, hora, dia, function(reserva) {
            const reservaGateway = new ReservaTableGateway();
            reservaGateway.loadReservas(user.uuid, function(err, listaReservas) {
                expect(listaReservas[0].uuid).toBe(reserva.uuid);

                done();
                return;
            });
        });
    });

    test('Client -> Cliente tiene operación para cancelar reservas', done => {
        const ReservaTableGateway = database.ReservaTableGateway;
        usuarios.__set__({ ReservaTableGateway: ReservaTableGateway });
        
        const user = new Client('3ffjwvw3eno', 'Cliente Prueba para Reservas 2', 0x01);

        const ofertaId = '080480fj20f02m30j02802380t82u0fj';
        const telefono = 660800902;
        const hora = '03:43';
        const dia = '29/12/22';

        user.hacerReserva(ofertaId, telefono, hora, dia, function(reserva) {
            user.cancelarReserva(reserva.uuid, function(err) {
                const reservaGateway = new ReservaTableGateway();
                reservaGateway.loadReservas(user.uuid, function(err, listaReservas) {
                    expect(listaReservas).toEqual([]);

                    done();
                    return;
                });
            })
        });
    });

    test('Owner -> Dueño puede crear ofertas', done => {
        const owner = new Owner('if3fjwe0cqw', 'Dueño Prueba para Reservas 1', 0x01);

        const localId = '42c2527790120456789j123456789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba 1';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            expect(oferta.foto).toBe(foto);

            done();
            return;
        });
    });

    test('Owner -> Las ofertas creadas por el dueño se crean activas', done => {
        const owner = new Owner('jf0f3n4nh4w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = '42c2527790120456789j123456789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba 2';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            expect(oferta.activa).toBeTruthy();

            done();
            return;
        });
    });

    test('Owner -> Las ofertas creadas por el dueño se guardan en Base de Datos', done => {
        const OfertaTableGateway = database.OfertaTableGateway;
        usuarios.__set__({ OfertaTableGateway: OfertaTableGateway });
        
        const owner = new Owner('o3fjw0vn34w', 'Dueño Prueba para Ofertas 3', 0x01);

        const localId = '3f0js0v0nv0n40bn034j123456789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba 2';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            const ofertaTableGateway = new OfertaTableGateway();
            ofertaTableGateway.loadOfertas(localId, function(err, listaOfertas) {
                expect(listaOfertas[0].uuid).toBe(oferta.uuid);

                done();
                return;
            });
        });
    });

    test('Owner -> Las ofertas creadas por el dueño se añaden a la lista de ofertas', done => {
        const owner = new Owner('jf0f3n4nh4w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = '42c2527790120456789j123456789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba 2';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            expect(owner.ofertas).toContain(oferta);

            done();
            return;
        });
    });

    test('Owner -> El dueño puede actualizar una oferta', done => {
        const owner = new Owner('jf0f3n4nh4w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = '42c2527790120456789j123456789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba para Editar 1';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            const newPrice = 22.1;
            owner.editarOferta(oferta.uuid, null, newPrice, null, function(err) {
                expect(oferta.precio).toBe(newPrice);

                done();
                return;
            });
        });
    });

    test('Owner -> Al editar una oferta se actualiza la Base de Datos', done => {
        const OfertaTableGateway = database.OfertaTableGateway;
        usuarios.__set__({ OfertaTableGateway: OfertaTableGateway });
        
        const owner = new Owner('jf0f3n4nh4w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = 'fasd3080fj0dfj234hn340fm06789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba para Editar 2';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            const newPrice = 22.1;
            owner.editarOferta(oferta.uuid, null, newPrice, null, function(err) {
                const ofertaTableGateway = new OfertaTableGateway();
                ofertaTableGateway.loadOfertas(localId, function(err, listaOfertas) {
                    expect(listaOfertas[0].precio).toBe(newPrice);

                    done();
                    return;
                });
            });
        });
    });

    test('Owner -> El dueño puede desactiva una oferta', done => {
        const owner = new Owner('f0asdjf034w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = 'afsdf30j210jv20vm0n402nf023nt012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba para Desactivar 1';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            owner.desactivarOferta(oferta.uuid, function(err) {
                expect(oferta.activa).toBeFalsy();

                done();
                return;
            });
        });
    });

    test('Owner -> Al desactivar una oferta se actualiza la Base de Datos', done => {
        const OfertaTableGateway = database.OfertaTableGateway;
        usuarios.__set__({ OfertaTableGateway: OfertaTableGateway });
        
        const owner = new Owner('30208fj404w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = '30920850820480258hn340fm06789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba para Desactivar 2';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            owner.desactivarOferta(oferta.uuid, function(err) {
                const ofertaTableGateway = new OfertaTableGateway();
                ofertaTableGateway.loadOfertas(localId, function(err, listaOfertas) {
                    expect(listaOfertas[0].activa).toBeFalsy();

                    done();
                    return;
                });
            });
        });
    });

    test('Owner -> Dueño puede crear locales', done => {
        const owner = new Owner('if3fjwe0cqw', 'Dueño Prueba para Locales 1', 0x01);

        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'

        owner.crearLocal(nombre, calle, codigoPostal, logo, function(err, local) {
            expect(local.calle).toBe(calle);

            done();
            return;
        });
    });

    test('Owner -> Los locales creados por el dueño se guardan en Base de Datos', done => {
        const LocalTableGateway = database.LocalTableGateway;
        usuarios.__set__({ LocalTableGateway: LocalTableGateway });
        
        const owner = new Owner('fasdf03jcqw', 'Dueño Prueba para Locales 2', 0x01);

        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'

        owner.crearLocal(nombre, calle, codigoPostal, logo, function(err, local) {
            const localTableGateway = new LocalTableGateway();
            localTableGateway.loadVenues(owner.uuid, function(err, listaLocales) {
                expect(listaLocales[0].uuid).toBe(local.uuid);

                done();
                return;
            });
        });
    });

    test('Owner -> Los locales creados por el dueño se añaden a la lista de locales', done => {
        const owner = new Owner('302fj02jg0w', 'Dueño Prueba para Locales 3', 0x01);

        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'

        owner.crearLocal(nombre, calle, codigoPostal, logo, function(err, local) {
            expect(owner.locales).toContain(local);

            done();
            return;
        });
    });

    test('Owner -> El dueño puede actualizar un local', done => {
        const owner = new Owner('330fj00jg0w', 'Dueño Prueba para Locales 3', 0x01);

        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'

        owner.crearLocal(nombre, calle, codigoPostal, logo, function(err, local) {
            const newCalle = 'Calle MIPS 42'
            owner.editarLocal(local.uuid, local.nombre, newCalle, local.codigoPostal, local.logo, function(err) {
                expect(local.calle).toBe(newCalle);

                done();
                return;
            });
        });
    });

    test('Owner -> Al editar un local se actualiza la Base de Datos', done => {
        const LocalTableGateway = database.LocalTableGateway;
        usuarios.__set__({ LocalTableGateway: LocalTableGateway });
        
        const owner = new Owner('39958020j0w', 'Dueño Prueba para Locales 3', 0x01);

        const nombre = 'Local';
        const calle = 'Calle Ensamblador 15';
        const codigoPostal = 29078;
        const logo = 'https://url.logo.com/logo.png'

        owner.crearLocal(nombre, calle, codigoPostal, logo, function(err, local) {
            const newCalle = 'Calle MIPS 42'
            owner.editarLocal(local.uuid, local.nombre, newCalle, local.codigoPostal, local.logo, function(err) {
                const localTableGateway = new LocalTableGateway();
                localTableGateway.loadVenues(owner.uuid, function(err, listaLocales){
                    expect(listaLocales[0].calle).toBe(newCalle);

                    done();
                    return;
                });
            });
        });
    });

    test.skip('Owner -> El dueño puede borrar un local', done => {
        const owner = new Owner('f0asdjf034w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = 'afsdf30j210jv20vm0n402nf023nt012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba para Desactivar 1';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            owner.desactivarOferta(oferta.uuid, function(err) {
                expect(oferta.activa).toBeFalsy();

                done();
                return;
            });
        });
    });

    test.skip('Owner -> Al borrar un local se actualiza la Base de Datos', done => {
        const OfertaTableGateway = database.OfertaTableGateway;
        usuarios.__set__({ OfertaTableGateway: OfertaTableGateway });
        
        const owner = new Owner('30208fj404w', 'Dueño Prueba para Ofertas 2', 0x01);

        const localId = '30920850820480258hn340fm06789012';
        const foto = 'http://url.foto.com/foto.png';
        const precio = 10.4;
        const descripcion = 'Oferta de Prueba para Desactivar 2';

        owner.hacerOferta(foto, precio, descripcion, localId, function(err, oferta) {
            owner.desactivarOferta(oferta.uuid, function(err) {
                const ofertaTableGateway = new OfertaTableGateway();
                ofertaTableGateway.loadOfertas(localId, function(err, listaOfertas) {
                    expect(listaOfertas[0].activa).toBeFalsy();

                    done();
                    return;
                });
            });
        });
    });
});