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
     Gallery lightbox — click to open, prev/next, keyboard, swipe, counter
     ------------------------------------------------------------------ */
  var galleryGrid = document.getElementById("galleryGrid");
  var lightbox = document.getElementById("lightbox");

  if (galleryGrid && lightbox) {
    var triggers = Array.prototype.slice.call(galleryGrid.querySelectorAll(".gallery-trigger"));
    var slides = triggers.map(function (trigger) {
      var img = trigger.querySelector("img");
      return { src: img.getAttribute("src"), alt: img.getAttribute("alt") };
    });

    var lightboxImg = document.getElementById("lightboxImg");
    var lightboxCaption = document.getElementById("lightboxCaption");
    var lightboxCounter = document.getElementById("lightboxCounter");
    var lightboxClose = document.getElementById("lightboxClose");
    var lightboxPrev = document.getElementById("lightboxPrev");
    var lightboxNext = document.getElementById("lightboxNext");
    var currentIndex = 0;
    var lastFocused = null;

    function renderSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      var slide = slides[currentIndex];
      lightboxImg.src = slide.src;
      lightboxImg.alt = slide.alt;
      lightboxCaption.textContent = slide.alt;
      lightboxCounter.textContent = (currentIndex + 1) + " / " + slides.length;
    }

    function openLightbox(index) {
      lastFocused = document.activeElement;
      renderSlide(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener("click", function () { openLightbox(index); });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", function () { renderSlide(currentIndex - 1); });
    lightboxNext.addEventListener("click", function () { renderSlide(currentIndex + 1); });

    /* tap on the backdrop (not the stage/image/controls) closes it */
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") renderSlide(currentIndex - 1);
      if (e.key === "ArrowRight") renderSlide(currentIndex + 1);
    });

    /* basic swipe support for touch devices */
    var touchStartX = null;
    lightbox.addEventListener(
      "touchstart",
      function (e) { touchStartX = e.changedTouches[0].clientX; },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      function (e) {
        if (touchStartX === null) return;
        var delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) {
          delta < 0 ? renderSlide(currentIndex + 1) : renderSlide(currentIndex - 1);
        }
        touchStartX = null;
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
