document.getElementById("contactForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
    };

    fetch("http://localhost:3000/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById("contactForm").reset();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Something went wrong!");
    });

});