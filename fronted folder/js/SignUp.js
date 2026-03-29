function signup() {

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value.trim();

    if (name === "" || email === "" || password === "") {
        alert("Please fill all fields");
        return;
    }

    //  Connect to backend
    fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.text())
    .then(data => {

        if (data.toLowerCase().includes("signup successful")) {
            alert("Signup Successful");
            window.location.href = "index.html";
        } else {
            alert(data);
        }

    })
    .catch(error => {
        console.error("Error:", error);
        alert("Server error. Try again.");
    });
}
