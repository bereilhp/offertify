const resennas = require('../../model/resennas');
const Resenna = resennas.Resenna;
const resennaFactory = resennas.resennaFactory;

test('resennaFactory() crea reseña', () => {
    const resenna = resennaFactory("Soy una reseña");
    expect(resenna).toBeInstanceOf(Resenna);
});

test('resennaFactory() crea uuids diferentes para cada reseña', () => {
    const resenna_1 = resennaFactory('Soy una reseña');
    const resenna_2 = resennaFactory('Soy una reseña');
    expect(resenna_1.uuid).not.toEqual(resenna_2.uuid);
});    

test('resennaFactory() crea uuid sólo si no se especifica', () => {
    const resenna = resennaFactory("Soy una reseña", "id");
    expect(resenna.uuid).toBe('id');
});