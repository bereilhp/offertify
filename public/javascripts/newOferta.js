$('#cancelar').on('click', function(e) {
    $('#formulario').attr('action', '/ofertasActivas');
    $('#formulario').attr('method', 'get');
});