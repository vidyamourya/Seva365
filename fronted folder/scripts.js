document.addEventListener("DOMContentLoaded", function () {

  let currentPage = window.location.pathname.split("/").pop();

  let navLinks = document.querySelectorAll(".nav-menu a");

  navLinks.forEach(function(link) {

    let linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }

  });

});
