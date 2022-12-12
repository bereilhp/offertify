// Cuando se pulse el botón "btn-contacto", se redirige el formulario a "/contacto"
$("#btn-contacto").on("click", function(e) {
    $("#formulario").attr("action", "/contacto");
});

// Cuando se pulse el botón "btn-login", se redirige el formulario a "/login"
$("#btn-login").on("click", function(e) {
    $("#formulario").attr("action", "/login");
});