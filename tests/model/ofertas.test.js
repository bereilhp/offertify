const ofertas = require('../../model/ofertas');
const Oferta = ofertas.Oferta;
const ofertaFactory = ofertas.ofertaFactory;

test('Oferta tiene uuid', () => {
    const uuid = 'id';
    const foto = 0b01
    const precio = 10;
    const activa = 1
    const descripcion = "Texto ejemplo"
    const oferta = new Oferta(uuid, foto, precio, activa,descripcion)
    expect(oferta.uuid).toBe(uuid);
});

test('Oferta tiene foto', () => {
    const uuid = 'id';
    const foto = 0b01
    const precio = 10;
    const activa = 1
    const descripcion = "Texto ejemplo"
    const oferta = new Oferta(uuid, foto, precio, activa,descripcion)
    expect(oferta.foto).toBe(foto);
});

test('Oferta tiene precio', () => {
    const uuid = 'id';
    const foto = 0b01
    const precio = 10;
    const activa = 1
    const descripcion = "Texto ejemplo"
    const oferta = new Oferta(uuid, foto, precio, activa,descripcion)
    expect(oferta.precio).toBe(precio);
});

test('Oferta tiene activa', () => {
    const uuid = 'id';
    const foto = 0b01
    const precio = 10;
    const activa = 1
    const descripcion = "Texto ejemplo"
    const oferta = new Oferta(uuid, foto, precio, activa,descripcion)
    expect(oferta.activa).toBe(activa);
});

test('Oferta tiene activa', () => {
    const uuid = 'id';
    const foto = 0b01
    const precio = 10;
    const activa = 1
    const descripcion = "Texto ejemplo"
    const oferta = new Oferta(uuid, foto, precio, activa,descripcion)
    expect(oferta.descripcion).toBe(descripcion);
});
test('ofertaFactory() crea ofertas', () => {
    const oferta = ofertaFactory('Foto',3,1,"test");
    expect(oferta).toBeInstanceOf(Oferta);
});

test('ofertaFactory() crea uuids diferentes para cada oferta', () => {
    const oferta_1 = ofertaFactory('Foto',3,1, "oferta_1");
    const oferta_2 = ofertaFactory('Foto',2,0, "oferta_2");
    expect(oferta_1.uuid).not.toEqual(oferta_2.uuid);
});    

test('ofertaFactory() crea uuid sólo si no se especifica', () => {
    const oferta = ofertaFactory('Foto',3,1, "oferta_1", "id");
    expect(oferta.uuid).toBe('id');
});
