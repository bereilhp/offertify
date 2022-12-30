const reservas = require('../../model/reservas');
const Reserva = reservas.Reserva;
const reservaFactory = reservas.reservaFactory

test('Reservas tiene descripcion', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789"
    const reserva = new Reserva(uuid,hora,dia,telefono)
    expect(reserva.uuid).toBe(uuid);
});

test('Reservas tiene descripcion', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789"
    const reserva = new Reserva(uuid,hora,dia,telefono)
    expect(reserva.hora).toBe(hora);
});

test('Reservas tiene descripcion', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789"
    const reserva = new Reserva(uuid,hora,dia,telefono)
    expect(reserva.dia).toBe(dia);
});

test('Reservas tiene descripcion', () => {
    const uuid = "id";
    const hora = "4:00 pm";
    const dia = "Viernes";
    const telefono = "123 456 789"
    const reserva = new Reserva(uuid,hora,dia,telefono)
    expect(reserva.telefono).toBe(telefono);
});
test('reservaFactory() crea reserva', () => {
    const reserva = reservaFactory("4:00 pm", "Viernes", "123 456 789");
    expect(reserva).toBeInstanceOf(Reserva);
});

test('reservaFactory() crea uuids diferentes para cada reserva', () => {
    const reserva_1 = reservaFactory("4:00 pm", "Viernes", "123 456 789");
    const reserva_2 = reservaFactory("4:00 pm", "Viernes", "123 456 789");
    expect(reserva_1.uuid).not.toEqual(reserva_2.uuid);
});    

test('reservasFactory() crea uuid sólo si no se especifica', () => {
    const reserva = reservaFactory("4:00 pm", "Viernes", "123 456 789", "id");
    expect(reserva.uuid).toBe('id');
});