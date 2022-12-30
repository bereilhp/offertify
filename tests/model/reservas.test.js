const reservas = require('../../model/reservas');
const Reserva = reservas.Reserva;
const reservaFactory = reservas.reservaFactory

test('Reservas tiene descripcion', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789";
    const idOferta = "123456789098765432123456789012";
    const reserva = new Reserva(uuid,hora,dia,telefono, idOferta);
    expect(reserva.uuid).toBe(uuid);
});

test('Reservas tiene hora', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789";
    const idOferta = "123456789098765432123456789012";
    const reserva = new Reserva(uuid,hora,dia,telefono,idOferta);
    expect(reserva.hora).toBe(hora);
});

test('Reservas tiene día', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789";
    const idOferta = "123456789098765432123456789012";
    const reserva = new Reserva(uuid,hora,dia,telefono,idOferta);
    expect(reserva.dia).toBe(dia);
});

test('Reservas tiene telefono', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789";
    const idOferta = "123456789098765432123456789012";
    const reserva = new Reserva(uuid,hora,dia,telefono,idOferta);
    expect(reserva.telefono).toBe(telefono);
});

test('Reservas tiene id oferta', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789";
    const idOferta = "123456789098765432123456789012";
    const reserva = new Reserva(uuid,hora,dia,telefono,idOferta);
    expect(reserva.idOferta).toBe(idOferta);
});

test('reservaFactory() crea reserva', () => {
    const reserva = reservaFactory("4:00 pm", "Viernes", "123 456 789","12345678800987654321123456789012");
    expect(reserva).toBeInstanceOf(Reserva);
});

test('reservaFactory() crea uuids diferentes para cada reserva', () => {
    const reserva_1 = reservaFactory("4:00 pm", "Viernes", "123 456 789","12345678800987654321123456789012");
    const reserva_2 = reservaFactory("4:00 pm", "Viernes", "123 456 789","12345678800987654321123456789012");
    expect(reserva_1.uuid).not.toEqual(reserva_2.uuid);
});    

test('reservasFactory() crea uuid sólo si no se especifica', () => {
    const reserva = reservaFactory("4:00 pm", "Viernes", "123 456 789","12345678800987654321123456789012", "id");
    expect(reserva.uuid).toBe('id');
});