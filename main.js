// Project Register — language switching + light motion.
(function () {
  "use strict";

  var STORAGE_KEY = "guojiz.lang";
  var DEFAULT_LANG = "en"; // English first.
  var LANGS = ["en", "zh"];

  function supported(lang) {
    return LANGS.indexOf(lang) !== -1 ? lang : DEFAULT_LANG;
  }
  function stored() {
    try { return supported(localStorage.getItem(STORAGE_KEY)); }
    catch (e) { return DEFAULT_LANG; }
  }

  function applyLang(lang) {
    lang = supported(lang);
    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll("[data-en]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var val = el.getAttribute("data-" + lang);
      if (val == null) continue;
      if (el.tagName === "META") {
        el.setAttribute("content", val);
      } else if (el.tagName === "TITLE") {
        document.title = val;
      } else {
        el.innerHTML = val;
      }
    }

    // Toggle button state.
    var opts = document.querySelectorAll(".lang-toggle .lang-opt");
    for (var j = 0; j < opts.length; j++) {
      opts[j].classList.toggle("on", opts[j].getAttribute("data-lang") === lang);
    }
  }

  function persist(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  // ---- Language toggle ----
  var toggle = document.querySelector(".lang-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = stored() === "en" ? "zh" : "en";
      applyLang(next);
      persist(next);
      toggle.focus();
    });
  }

  // Apply on load (stored preference, else English).
  applyLang(stored());

  // ---- Motion (respects reduced motion) ----
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    document.querySelectorAll("[data-rise]").forEach(function (el) {
      el.classList.add("rise", "static");
    });
    document.querySelectorAll(".entry").forEach(function (el) {
      el.classList.add("in");
    });
    return;
  }

  document.querySelectorAll("[data-rise]").forEach(function (el, i) {
    el.style.setProperty("--i", i);
    el.classList.add("rise");
  });

  var entries = document.querySelectorAll(".entry");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (records) {
      records.forEach(function (r) {
        if (r.isIntersecting) {
          r.target.classList.add("in");
          io.unobserve(r.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    entries.forEach(function (el) { io.observe(el); });
  } else {
    entries.forEach(function (el) { el.classList.add("in"); });
  }
})();
