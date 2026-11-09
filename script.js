/* New World Solutions — shared site behavior */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- Language toggle (TH / EN) ---- */
  function setLang(lang) {
    root.classList.remove("lang-th", "lang-en");
    root.classList.add("lang-" + lang);
    root.setAttribute("lang", lang);

    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    try {
      localStorage.setItem("nws-lang", lang);
    } catch (e) { /* storage unavailable */ }
  }

  var saved = null;
  try { saved = localStorage.getItem("nws-lang"); } catch (e) { saved = null; }
  if (saved === "en" || saved === "th") { setLang(saved); }

  document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-lang"));
    });
  });

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- Consultation form (mailto) ---- */
  var form = document.getElementById("consultation-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var value = function (selector) {
        var el = form.querySelector(selector);
        return (el && el.value ? el.value : "").trim() || "-";
      };

      var body = [
        "New World Solutions — consultation request",
        "",
        "Name: " + value("#contact-name"),
        "Company: " + value("#company-name"),
        "Email: " + value("#contact-email"),
        "Phone: " + value("#contact-phone"),
        "Area of interest: " + value("#contact-interest"),
        "",
        "Message:",
        value("#contact-message")
      ].join("\n");

      var subject = "Consultation request — nwsthai.com";
      window.location.href = "mailto:support@nwsthai.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }
})();
