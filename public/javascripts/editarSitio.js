// Manejador para el botón de Añadir
$('#annadir-btn').on('click', function(e) {
    // Establecemos la ruta del POST
    $('#formulario').attr('action', '/editarSitio/annadir');

    // Hacemos visible el formulario
    $('#formulario').removeClass('d-none');
});

// Manejador para el botón de cancelar
$('#cancelar-btn').on('click', function(e) {
    // Limpiamos los campos del formulario
    $('#local-input').val("");
    $('#calle-textarea').val("");
    $('#codigoPostal').val("");
    $('#imagen').val("");

    // Ocultamos el formulario
    $('#formulario').addClass('d-none');
});
