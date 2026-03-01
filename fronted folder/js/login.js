//login.js
document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("loginForm").addEventListener("submit", function (event) {

    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    let emailError = document.getElementById("emailError");
    let passError = document.getElementById("passError");

    emailError.innerHTML = "";
    passError.innerHTML = "";

    if (email === "") {
      emailError.innerHTML = "Email is required";
      return;
    }

    if (password === "") {
      passError.innerHTML = "Password is required";
      return;
    }

   fetch("http://localhost:3000/login", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ email, password })
    })
   .then(res => res.json())
   .then(data => {
     
    if (data.role) {   // means login successful

        alert("Login Successful!");

        if (data.role === "admin") {
            window.location.href = "admin/admin";
        } else {
            window.location.href = "user_home";
        }
      }else {
       alert(data.message || "Login failed");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Server error. Try again.");
    });

  });

});