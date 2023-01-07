// Añadimos un listener a los botones de editar
$('.editar-btn').on('click', function(e) {
    // Obtenemos la oferta
    const oferta = null;
    const ofertaId = $('this').attr('id');
    ofertas.forEach((o) => {
        if (o.uuid = ofertaId) {
            oferta = o;
        }
    })

    // Rellenamos los campos del formulario
    // TO DO
});

