document.addEventListener("DOMContentLoaded", function () {

  const serviceSelect = document.getElementById("service");
  const subServiceGroup = document.getElementById("subServiceGroup");
  const subServiceSelect = document.getElementById("subService");
  const subServiceLabel = document.getElementById("subServiceLabel");
  const form = document.getElementById("bookingForm");
  const successMsg = document.getElementById("successMsg");

  if (!form || !serviceSelect) return;

  // Disable Past Dates
  const dateInput = document.getElementById("date");
  if (dateInput) {
    let today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // Service Change Event
  serviceSelect.addEventListener("change", function () {

    const service = this.value;
    subServiceSelect.innerHTML = "";

    if (service === "Cleaning") {

      subServiceGroup.style.display = "block";
      subServiceLabel.textContent = "Type of Cleaning";
      addOptions(["Laundary and Home Cleaning", "Kitchen Cleaning", "Sanitization services"]);

    } else if (service === "Cooking") {

      subServiceGroup.style.display = "block";
      subServiceLabel.textContent = "Type of Food";
      addOptions(["Indian", "Italian", "Continental"]);

    } else if (service === "Event") {

      subServiceGroup.style.display = "block";
      subServiceLabel.textContent = "Type of Event";
      addOptions(["Dinner", "Puja", "Surprise Event"]);

    } else {
      subServiceGroup.style.display = "none";
    }
  });

  function addOptions(options) {
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "-- Select Option --";
    defaultOption.value = "";
    subServiceSelect.appendChild(defaultOption);

    options.forEach(option => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      subServiceSelect.appendChild(opt);
    });
  }

  // Form Submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = serviceSelect.value;
    const subService = subServiceSelect.value;
    const date = document.getElementById("date").value;
    const message = document.getElementById("message")?.value.trim() || "";

    if (!name || !email || !phone || !service || !date) {
      alert("Please fill all required fields!");
      return;
    }

    if (subServiceGroup.style.display === "block" && !subService) {
      alert("Please select service type!");
      return;
    }

    // Send data to backend
    fetch("http://localhost:3000/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        service: service,
        sub_service: subService,
        booking_date: date,
        message: message
      })
    })
    .then(response => response.text())
    .then(data => {

      successMsg.style.display = "block";

      setTimeout(() => {
        successMsg.style.display = "none";
      }, 3000);

      form.reset();
      subServiceGroup.style.display = "none";

    })
    .catch(error => {
      console.error("Error:", error);
      alert("Something went wrong while saving booking!");
    });

  });

});