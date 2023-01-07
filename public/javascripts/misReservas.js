// Listener para botón chat
$('#chat-btn').on('click', function(e) {
    // Obtenemos el formulario
    $(this).parent().attr('action', '/Reservas/chat');
});

// Listener para botón cancelar
$('#cancelar-btn').on('click', function(e) {
    // Obtenemos el formulario
    $(this).parent().attr('action', '/Reservas/cancelar');
});