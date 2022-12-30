const mensajes = require('../../model/mensajes');
const Mensaje = mensajes.Mensaje;
const mensajeFactory = mensajes.mensajeFactory;

test('Mensaje tiene uuid', () => {
    const uuid = 'id';
    const nombreUsuario = 'Pepe';
    const texto = 'Me gustó mucho su local';
    const timestamp = 100;
    const mensaje = new Mensaje(uuid, nombreUsuario,texto,timestamp);
    expect(mensaje.uuid).toBe(uuid);
});

test('Mensaje tiene nombre', () => {
    const uuid = 'id';
    const nombreUsuario = 'Pepe';
    const texto = 'Me gustó mucho su local';
    const timestamp = 100;
    const mensaje = new Mensaje(uuid, nombreUsuario,texto,timestamp);
    expect(mensaje.nombreUsuario).toBe(nombreUsuario);
});

test('Mensaje tiene texto', () => {
    const uuid = 'id';
    const nombreUsuario = 'Pepe';
    const texto = 'Me gustó mucho su local';
    const timestamp = 100;
    const mensaje = new Mensaje(uuid, nombreUsuario,texto,timestamp);
    expect(mensaje.texto).toBe(texto);
});

test('Mensaje tiene timestamp', () => {
    const uuid = 'id';
    const nombreUsuario = 'Pepe';
    const texto = 'Me gustó mucho su local';
    const timestamp = 100;
    const mensaje = new Mensaje(uuid, nombreUsuario,texto,timestamp);
    expect(mensaje.timestamp).toBe(timestamp);
});

test('mensajeFactory() crea Mnesajes', () => {
    const mensaje = mensajeFactory('Nombre', 'Me gustó su menú', 100);
    expect(mensaje).toBeInstanceOf(Mensaje);
});

test('mensajeFactory() crea uuids diferentes para cada mensaje', () => {
    const mensaje_1 = mensajeFactory('Nombre', 'Me gustó su menu', 100);
    const mensaje_2 = mensajeFactory('Nombre', 'Muy accesible el restaurante', 101);
    expect(mensaje_1.uuid).not.toEqual(mensaje_2.uuid);
});    

test('mensajeFactory() crea uuid sólo si no se especifica', () => {
    const mensaje = mensajeFactory('Nombre', 'Me gustó su menú', 100, 'id');
    expect(mensaje.uuid).toBe('id');
});