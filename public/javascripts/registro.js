$("#submit-btn").on("click", function(e) {
    clearInvalidMarkers();

    let valid = true;
    valid = validateEmail() && valid;
    valid = validatePassword() && valid;

    if (!valid) {
        e.preventDefault();
    }
});

function validateEmail() {
    let email = $("#email-input").val();

    // Regex para correo según RFC2822:
    //  -> empieza por al menos 1 caracter alfanumérico o uno de los siguientes: ! # $ % & ' * + / = ? ^ _ ` { | } ~ -
    //  -> Encuentra un punto. Repite la condición anterior (Esta línea puede ocurrir 0 o muchas veces)
    //  -> Continúa con @
    //  -> Reglas para dominio: comienza por alfanumérico, continúa con alfanumérico o « - » y acaba con alfanumérico (esta línea mínimo una vez)
    rfc2822Regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (rfc2822Regex.test(email)) {
        return true;
    } else {
        // Mensaje de error
        $("#email-input").addClass("is-invalid");
        $("#div-email").append(createInvalidFeedback("Introduzca un email válido"));
        return false;
    }
}

function validatePassword() {
    firstPassword = $("#password-input").val();
    secondPassword = $("#repeat-password-input").val();

    // Contraseña válida (recomendaciones NIST):
    //  -> Ambas iguales
    //  -> Al menos 8 caracteres
    let valid = true;
    if (firstPassword !== secondPassword) {
        $("#repeat-password-input").addClass("is-invalid");
        $("#repeat-password-input").parent().append(createInvalidFeedback("Las constraseñas deben ser iguales"));
        valid = false;
    }
    if (firstPassword.length < 8) {
        $("#password-input").addClass("is-invalid");
        $("#password-input").parent().append(createInvalidFeedback("La contraseña debe tener al menos 8 caracteres"));
        valid = false;
    } 

    return valid;
}

function createInvalidFeedback(message) {
    return `<div class="invalid-feedback">${message}</div>`;
}

function clearInvalidMarkers() {
    $(".invalid-feedback").remove();
    $("input").removeClass("is-invalid");
}