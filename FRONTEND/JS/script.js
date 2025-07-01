// script.js
function togglePassword(id, icon) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

function toggleForm(role) {
  const title = document.getElementById(role + "FormTitle");
  const extraFields = document.getElementById("extra" + capitalize(role) + "Fields");
  const button = document.querySelector(`#${role}Form button`);
  const toggleText = document.querySelector(`#${role}Form .toggle-link`);

  if (title.innerText.includes("Sign In")) {
    title.innerText = title.innerText.replace("Sign In", "Sign Up");
    extraFields.classList.remove("hidden");
    button.innerText = "Register";
    toggleText.innerText = "Already have an account? Sign in";
  } else {
    title.innerText = title.innerText.replace("Sign Up", "Sign In");
    extraFields.classList.add("hidden");
    button.innerText = "Submit";
    toggleText.innerText = "Don't have an account? Sign up";
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
