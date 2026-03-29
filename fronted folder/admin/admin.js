
// Your server address
var API = "http://localhost:3000";

// Store all bookings here
var allBookings = [];

// Current filter (all / pending / accepted / denied)
var currentFilter = "all";

// Colors for avatar circles
var colors = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#06b6d4"];

window.onload = function() {
  showTodayDate();
  loadBookings();
  loadUsers();
};

function showTodayDate() {
  var today = new Date();
  var options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  document.getElementById("dateDisplay").textContent = today.toLocaleDateString("en-IN", options);
}
function loadBookings() {

  // fetch() sends a request to your Express server
  fetch(API + "/admin/bookings")

  .then(function(response) {
    // Convert the response to JSON
    return response.json();
  })

  .then(function(data) {
    // data = array of bookings from your MySQL table
    allBookings = data;

    // Now show them on screen
    showBookings();
    updateStatNumbers();
    updateServiceBars();
  })

  .catch(function(error) {
    // If server is not running, show error
    console.log("Error loading bookings:", error);
    document.getElementById("bookingsBody").innerHTML =
      "<tr><td colspan='6' style='text-align:center; padding:30px; color:red;'>" +
      "Cannot connect to server. Make sure node server.js is running." +
      "</td></tr>";
  });

}
function loadUsers() {

  fetch(API + "/admin/users")

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {
    // data = array of users from your MySQL users table
    document.getElementById("totalUsers").textContent = data.length;
    showUsers(data);
  })

  .catch(function(error) {
    console.log("Error loading users:", error);
    document.getElementById("usersList").innerHTML =
      "<div style='padding:20px; text-align:center; color:red;'>Cannot load users.</div>";
  });

}
// ================================
// ACCEPT OR DENY BOOKING
// Called when admin clicks Accept or Deny button
// ================================
function updateBooking(id, newStatus) {

  fetch(API + "/admin/bookings/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: newStatus })
  })

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {
    // Update the booking status in our local array
    for (var i = 0; i < allBookings.length; i++) {
      if (allBookings[i].id === id) {
        allBookings[i].status = newStatus;
      }
    }

    // Refresh the table, numbers, and bars
    showBookings();
    updateStatNumbers();
    updateServiceBars();
    updatePendingBadge();

    // Show success message
    if (newStatus === "accepted") {
      showToast("Booking Accepted!", "success");
    } else {
      showToast("Booking Denied.", "denied");
    }
  })

  .catch(function(error) {
    console.log("Update error:", error);
    showToast("Failed to update. Check server.", "error");
  });

}
// ================================
// SHOW BOOKINGS IN TABLE
// Reads from allBookings array
// ================================
function showBookings() {

  var tbody = document.getElementById("bookingsBody");

  // Filter bookings based on selected tab
  var list = [];

  if (currentFilter === "all") {
    list = allBookings;
  } else {
    for (var i = 0; i < allBookings.length; i++) {
      if (allBookings[i].status === currentFilter) {
        list.push(allBookings[i]);
      }
    }
  }

  // If no bookings found
  if (list.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:30px; color:gray;'>No bookings found.</td></tr>";
    return;
  }

  // Build table rows
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var b = list[i]; // b = one booking object

    // Pick a color for the avatar circle
    var avatarColor = colors[b.id % colors.length];

    // First letter of name for avatar
    var firstLetter = b.name ? b.name[0].toUpperCase() : "?";

    // Format the date nicely
    var formattedDate = formatDate(b.booking_date);

    // Build action buttons (only show if pending)
    var actionHTML = "";
    if (b.status === "pending") {
      actionHTML =
        "<div class='action-btns'>" +
        "<button class='btn-accept' onclick='updateBooking(" + b.id + ", \"accepted\")'>Accept</button>" +
        "<button class='btn-deny'   onclick='updateBooking(" + b.id + ", \"denied\")'>Deny</button>" +
        "</div>";
    } else {
      actionHTML = "<span class='status-done'>Done</span>";
    }

    // Build one table row
    html +=
      "<tr>" +

      // Customer name + phone
      "<td>" +
        "<div class='user-cell'>" +
          "<div class='user-av' style='background:" + avatarColor + "'>" + firstLetter + "</div>" +
          "<div>" +
            "<div class='user-name'>" + (b.name || "—") + "</div>" +
            "<div class='user-phone'>" + (b.phone || "—") + "</div>" +
          "</div>" +
        "</div>" +
      "</td>" +

      // Service
      "<td>" + getServiceTag(b.service) + "</td>" +

      // Sub service
      "<td><span style='font-size:12px; color:gray;'>" + (b.sub_service || "—") + "</span></td>" +

      // Booking date
      "<td><div style='font-size:13px; font-weight:600;'>" + formattedDate + "</div></td>" +

      // Status pill
      "<td>" + getStatusPill(b.status) + "</td>" +

      // Accept / Deny buttons
      "<td>" + actionHTML + "</td>" +

      "</tr>";
  }

  tbody.innerHTML = html;
}


// ================================
// SHOW USERS IN RIGHT PANEL
// ================================
function showUsers(users) {

  var container = document.getElementById("usersList");

  if (!users || users.length === 0) {
    container.innerHTML = "<div style='padding:20px; text-align:center; color:gray;'>No users yet.</div>";
    return;
  }

  var html = "";

  // Show only first 5 users
  var limit = users.length > 5 ? 5 : users.length;

  for (var i = 0; i < limit; i++) {
    var u = users[i];
    var avatarColor = colors[i % colors.length];
    var firstLetter = u.name ? u.name[0].toUpperCase() : "?";

    html +=
      "<div class='user-list-item'>" +

        // Avatar circle
        "<div class='user-av' style='background:" + avatarColor + "; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; color:white; flex-shrink:0;'>" +
          firstLetter +
        "</div>" +

        // Name and email
        "<div class='user-info-text'>" +
          "<p>" + (u.name  || "—") + "</p>" +
          "<span>" + (u.email || "—") + "</span>" +
        "</div>" +

        // Booking count
        "<div class='user-count'>" +
          "<strong>" + (u.total_bookings || 0) + "</strong>" +
          "<small>bookings</small>" +
        "</div>" +

      "</div>";
  }

  container.innerHTML = html;
}


// ================================
// UPDATE STAT NUMBERS (top 4 cards)
// ================================
function updateStatNumbers() {

  var total    = allBookings.length;
  var pending  = 0;
  var accepted = 0;

  for (var i = 0; i < allBookings.length; i++) {
    if (allBookings[i].status === "pending")  pending++;
    if (allBookings[i].status === "accepted") accepted++;
  }

  document.getElementById("totalBookings").textContent  = total;
  document.getElementById("pendingCount").textContent   = pending;
  document.getElementById("acceptedCount").textContent  = accepted;

  updatePendingBadge();
}


// ================================
// UPDATE PENDING BADGE IN SIDEBAR
// ================================
function updatePendingBadge() {
  var count = 0;
  for (var i = 0; i < allBookings.length; i++) {
    if (allBookings[i].status === "pending") count++;
  }
  document.getElementById("pendingBadge").textContent = count;

  // Show red dot on bell if pending bookings exist
  var dot = document.getElementById("notifDot");
  if (dot) {
    if (count > 0) {
      dot.style.display = "block";
    } else {
      dot.style.display = "none";
    }
  }
}


// ================================
// UPDATE SERVICE BARS (right panel)
// ================================
function updateServiceBars() {

  var total    = allBookings.length;
  var cooking  = 0;
  var cleaning = 0;
  var events   = 0;

  for (var i = 0; i < allBookings.length; i++) {
    var s = allBookings[i].service;
    if (s === "Cooking")  cooking++;
    if (s === "Cleaning") cleaning++;
    if (s === "Event" || s === "Small Event Management") events++;
  }

  // Avoid divide by zero
  if (total === 0) total = 1;

  var pctCooking  = Math.round((cooking  / total) * 100);
  var pctCleaning = Math.round((cleaning / total) * 100);
  var pctEvents   = Math.round((events   / total) * 100);

  // Animate bars after small delay
  setTimeout(function() {
    document.getElementById("bar-cooking").style.width  = pctCooking  + "%";
    document.getElementById("bar-cleaning").style.width = pctCleaning + "%";
    document.getElementById("bar-events").style.width   = pctEvents   + "%";

    document.getElementById("pct-cooking").textContent  = pctCooking  + "%";
    document.getElementById("pct-cleaning").textContent = pctCleaning + "%";
    document.getElementById("pct-events").textContent   = pctEvents   + "%";
  }, 400);
}
// ================================
// FILTER TAB CLICKED
// Called from HTML: onclick="filterBookings('pending', this)"
// ================================
function filterBookings(filter, btn) {

  // Remember which filter is selected
  currentFilter = filter;

  // Remove 'active' class from all tabs
  var tabs = document.querySelectorAll(".tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  // Add 'active' class to clicked tab
  btn.classList.add("active");

  // Re-render the table with filter applied
  showBookings();
}


// ================================
// SHOW TOAST NOTIFICATION
// ================================
function showToast(message, type) {

  var container = document.getElementById("toastContainer");

  // Create a new div for the toast
  var toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;

  // Add to page
  container.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(function() {
    toast.style.opacity   = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s";

    setTimeout(function() {
      toast.remove();
    }, 300);
  }, 2800);
}


// ================================
// HELPER: Format date from MySQL
// MySQL gives: 2025-03-01T00:00:00.000Z
// We want:     01 Mar 2025
// ================================
function formatDate(dateStr) {
  if (!dateStr) return "—";
  var d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}
// ================================
// HELPER: Return service colour tag HTML
// ================================
function getServiceTag(service) {
  if (!service) return "<span>—</span>";

  if (service === "Cooking") {
    return "<span class='service-tag tag-cook'>Cooking</span>";
  } else if (service === "Cleaning") {
    return "<span class='service-tag tag-clean'>Cleaning</span>";
  } else if (service === "Event" || service === "Small Event Management") {
    return "<span class='service-tag tag-event'>Event</span>";
  } else {
    return "<span class='service-tag tag-other'>" + service + "</span>";
  }
}
// ================================
// HELPER: Return status pill HTML
// ================================
function getStatusPill(status) {
  if (status === "accepted") {
    return "<span class='status-pill pill-accepted'>Accepted</span>";
  } else if (status === "denied") {
    return "<span class='status-pill pill-denied'>Denied</span>";
  } else {
    return "<span class='status-pill pill-pending'>Pending</span>";
  }
}
