(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Header: hide on scroll down / show on scroll up, transparent -> solid
     ------------------------------------------------------------------ */
  var header = document.getElementById("siteHeader");
  var progressBar = document.getElementById("scrollProgress");
  var lastY = window.scrollY;
  var solidThreshold = Math.round(window.innerHeight * 0.7);
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;

    header.classList.toggle("is-solid", y > solidThreshold);

    if (y > lastY && y > header.offsetHeight) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }
    lastY = y;

    if (progressBar) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progressBar.style.width = pct.toFixed(1) + "%";
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------
     Mobile menu: open / close via button, overlay tap, and link tap
     ------------------------------------------------------------------ */
  var menuToggle = document.getElementById("menuToggle");
  var menuClose = document.getElementById("menuClose");
  var mobileMenu = document.getElementById("mobileMenu");
  var mobileLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];

  function openMenu() {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", openMenu);
    menuClose.addEventListener("click", closeMenu);

    /* tap on the solid overlay/background itself (not on the nav panel content) */
    mobileMenu.addEventListener("click", function (e) {
      if (e.target === mobileMenu) closeMenu();
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal (IntersectionObserver) — fade + translateY, staggered
     ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(".reveal, .stagger");

  if ("IntersectionObserver" in window && revealTargets.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------
     Hero parallax — subtle, transform-only, capped, skipped on reduced motion
     ------------------------------------------------------------------ */
  var heroMedia = document.getElementById("heroMedia");

  if (heroMedia && !reduceMotion) {
    var heroEl = document.getElementById("inicio");
    var parallaxTicking = false;

    function updateParallax() {
      var rect = heroEl.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var progress = 1 - rect.bottom / (window.innerHeight + rect.height);
        var shift = progress * 14; /* max ~14% translate, well under the 15-20% cap */
        heroMedia.style.transform = "translateY(" + shift.toFixed(2) + "%)";
      }
      parallaxTicking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!parallaxTicking) {
          window.requestAnimationFrame(updateParallax);
          parallaxTicking = true;
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
