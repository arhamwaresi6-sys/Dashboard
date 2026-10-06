const form = document.getElementById("registerForm");

const password1 = document.getElementById("password1");
const password2 = document.getElementById("password2");

const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");

/* SHOW / HIDE PASSWORD */

const showPasswordButtons = document.querySelectorAll(".show-password");

showPasswordButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);

    if (input.type === "password") {
      input.type = "text";
      button.textContent = "Hide";
    } else {
      input.type = "password";
      button.textContent = "Show";
    }
  });
});

/* CHECK PASSWORDS WHILE TYPING */

function checkPasswords() {
  if (!password2.value) {
    passwordError.textContent = "";
    return true;
  }

  if (password1.value !== password2.value) {
    passwordError.textContent = "Passwords do not match.";
    return false;
  }

  passwordError.textContent = "";
  return true;
}

password1.addEventListener("input", checkPasswords);
password2.addEventListener("input", checkPasswords);

/* FORM SUBMIT */

form.addEventListener("submit", (event) => {
  if (!checkPasswords()) {
    event.preventDefault();
    return;
  }

  formMessage.textContent = "";
});
