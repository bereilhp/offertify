$("#submit-btn").on("submit", function(e) {
    let valid = true;
    valid &&= validateEmail();
    valid &&= validatePassword();

    if (!valid) {
        e.preventDefault();
    }
});

function validateEmail() {
    let email = $("#email-input").val()

    
}

function validatePassword() {

}