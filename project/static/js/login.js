const loginForm = document.getElementById("loginForm");

const password = document.getElementById("password");

const showPassword = document.getElementById("showPassword");

const formMessage = document.getElementById("formMessage");

/* SHOW / HIDE PASSWORD */

showPassword.addEventListener("click", () => {
  if (password.type === "password") {
    password.type = "text";
    showPassword.textContent = "Hide";
  } else {
    password.type = "password";
    showPassword.textContent = "Show";
  }
});

/* FORM SUBMIT */

loginForm.addEventListener("submit", () => {
  formMessage.textContent = "";
});
