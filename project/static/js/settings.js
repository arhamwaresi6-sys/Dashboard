
const passwordForm = document.getElementById("passwordForm");
const passwordMessage = document.getElementById("passwordMessage");

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const currentPassword =
    document.getElementById("currentPassword").value;

  const newPassword =
    document.getElementById("newPassword").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;


  /* =========================
     BASIC VALIDATION
     ========================= */

  if (newPassword !== confirmPassword) {
    passwordMessage.textContent = "New passwords do not match.";
    return;
  }

  if (newPassword.length < 6) {
    passwordMessage.textContent =
      "Password must be at least 6 characters.";

    return;
  }


  passwordMessage.textContent = "Updating...";


  try {

    const response = await fetch("/settings/password", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });


    const data = await response.json();


    if (!response.ok) {
      passwordMessage.textContent =
        data.error || "Something went wrong.";

      return;
    }


    passwordMessage.textContent =
      data.message || "Password updated successfully.";

    passwordForm.reset();

  } catch (error) {

    console.error(error);

    passwordMessage.textContent =
      "Could not connect to the server.";

  }
});
