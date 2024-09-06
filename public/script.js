const container = document.querySelector(".container"),
      pwShowHide = document.querySelectorAll(".showHidePw"),
      pwFields = document.querySelectorAll(".passwords"),
      signUp = document.querySelector(".signup-link"),
      login = document.querySelector(".login-link");

// js code to show/hide password and change icon
pwShowHide.forEach((eyeIcon, index) => {
  eyeIcon.addEventListener("click", () => {
    const pwField = pwFields[index]; // Get the corresponding password field

    if (pwField.type === "password") {
      pwField.type = "text";
      eyeIcon.classList.replace("uil-eye-slash", "uil-eye");
    } else {
      pwField.type = "password";
      eyeIcon.classList.replace("uil-eye", "uil-eye-slash");
    }
  });
});

signUp.addEventListener("click", () => {
  container.classList.add("active");
});

login.addEventListener("click", () => {
  container.classList.remove("active");
});