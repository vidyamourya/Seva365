document.addEventListener("DOMContentLoaded", function () {

  let currentPage = window.location.pathname.split("/").pop();

  let navLinks = document.querySelectorAll(".nav-menu a");

  navLinks.forEach(function(link) {

    let linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }

  });
  // 🔔 Notification Button
  const notifyBtn = document.getElementById("notifyBtn");

  if (notifyBtn) {
    notifyBtn.addEventListener("click", function () {
        alert("You have new booking updates!");
    });
  }

  // 📄 Load All Bookings (Admin Page)
  const bookingTable = document.getElementById("bookingTable");
  if (bookingTable) {
    fetch("/all-bookings")
        .then(res => res.json())
        .then(data => {
            data.forEach(booking => {
                bookingTable.innerHTML += `
                    <tr>
                        <td>${booking.id}</td>
                        <td>${booking.name}</td>
                        <td>${booking.service}</td>
                        <td>${booking.sub_service}</td>
                        <td>${booking.booking_date.split('T')[0]}</td>
                        <td>${booking.preferred_time}</td>
                        <td>${booking.address}</td>
                        <td>${booking.city}</td>
                    </tr>
                `;
            });
        });
  }
  // 👤 Load User Bookings
  const table = document.getElementById("adminUserTable");
  fetch("/admin-users")
  .then(res => res.json())
  .then(data => {
      console.log("Users Data:", data);   //  IMPORTANT DEBUG
      data.forEach(user => {
          table.innerHTML += `
              <tr>
                  <td>${user.id}</td>
                  <td>${user.name}</td>
                  <td>${user.email}</td>
              </tr>
          `;
      });
  });

});
// 🍳 Load Cooking Bookings
fetch("/admin/cooking-bookings")
.then(res => res.json())
.then(data => {
    console.log("Cooking Data:", data);   // DEBUG

    const table = document.getElementById("adminCookingTable");

    data.forEach(booking => {
        table.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.name}</td>
                <td>${booking.sub_service}</td>
                <td>${booking.booking_date.split('T')[0]}</td>
                <td>${booking.preferred_time}</td>
                <td>${booking.address}</td>
                <td>${booking.city}</td>
            </tr>
        `;
    });
});
//  Load Cleaning Bookings
fetch("/admin/cleaning-bookings")
.then(res => res.json())
.then(data => {
    console.log("Cleaning Data:", data);   // DEBUG

    const table = document.getElementById("adminCleaningTable");

    data.forEach(booking => {
        table.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.name}</td>
                <td>${booking.sub_service}</td>
                <td>${booking.booking_date.split('T')[0]}</td>
                <td>${booking.preferred_time}</td>
                <td>${booking.address}</td>
                <td>${booking.city}</td>
            </tr>
        `;
    });
});
//  Load Event Bookings
fetch("/admin/event-bookings")
.then(res => res.json())
.then(data => {
    console.log("Event Data:", data);   // DEBUG

    const table = document.getElementById("adminEventTable");

    data.forEach(booking => {
        table.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.name}</td>
                <td>${booking.sub_service}</td>
                <td>${booking.booking_date.split('T')[0]}</td>
                <td>${booking.preferred_time}</td>
                <td>${booking.address}</td>
                <td>${booking.city}</td>
            </tr>
        `;
    });
});
