(function () {
  "use strict";

  var STORAGE_KEY = "guojiz.lang";
  var LANGS = ["en", "zh"];
  var currentLang = "en";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function supported(lang) {
    return LANGS.indexOf(lang) !== -1 ? lang : "en";
  }

  function readStoredLanguage() {
    try { return supported(localStorage.getItem(STORAGE_KEY)); }
    catch (error) { return "en"; }
  }

  function saveLanguage(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); }
    catch (error) { /* Language still works for the current page. */ }
  }

  function applyLanguage(lang) {
    currentLang = supported(lang);
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-en]").forEach(function (element) {
      var value = element.getAttribute("data-" + currentLang);
      if (value === null) return;

      if (element.tagName === "META") {
        element.setAttribute("content", value);
      } else if (element.tagName === "TITLE") {
        document.title = value;
      } else {
        element.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-href-en]").forEach(function (element) {
      var href = element.getAttribute("data-href-" + currentLang);
      if (href) element.setAttribute("href", href);
    });

    document.querySelectorAll(".lang-opt").forEach(function (option) {
      option.classList.toggle("on", option.getAttribute("data-lang") === currentLang);
    });

    var toggle = document.querySelector(".lang-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", currentLang === "en" ? "Switch to Chinese" : "切换到英文");
    }
  }

  var languageToggle = document.querySelector(".lang-toggle");
  if (languageToggle) {
    languageToggle.addEventListener("click", function () {
      var next = currentLang === "en" ? "zh" : "en";
      applyLanguage(next);
      saveLanguage(next);
    });
  }
  applyLanguage(readStoredLanguage());

  var revealItems = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  }

  var art = document.querySelector(".hero-art");
  if (art && !reduceMotion) {
    art.addEventListener("pointermove", function (event) {
      var bounds = art.getBoundingClientRect();
      var x = (event.clientX - bounds.left) / bounds.width - 0.5;
      var y = (event.clientY - bounds.top) / bounds.height - 0.5;
      art.style.setProperty("--art-x", (x * 9).toFixed(2) + "px");
      art.style.setProperty("--art-y", (y * 7).toFixed(2) + "px");
    });
    art.addEventListener("pointerleave", function () {
      art.style.setProperty("--art-x", "0px");
      art.style.setProperty("--art-y", "0px");
    });
  }

  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".primary-nav a[href^='#']");
  if ("IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
