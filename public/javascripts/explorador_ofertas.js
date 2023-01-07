// Añadimos un listener los botones de reservar
$('.reservar-btn').on('click', function(e) {
    // LLamamos a reservar usando el id del botón (id de la oferta)
    const oferta = $(this).attr('id');
    reservar(oferta);
});

function reservar(oferta) {
    // Establecemos la oferta que se va a reservar
    $('#submit').attr('value', oferta);

    // Mostramos el formulario de reservar
    $('#formularioReserva').removeClass('d-none');
}