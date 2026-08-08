(function () {
  "use strict";

  var STORAGE_KEY = "guojiz.lang";
  var LANGS = ["en", "zh"];
  var currentLang = "en";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Demo videos — one entry per featured project.
     Paste a video URL (YouTube / Bilibili / etc.) to make a "Watch Demo"
     link appear in that project's hub cell. Leave the string empty and
     no button is rendered. Example:
       "gitlearnos": "https://youtu.be/xxxx" */
  var PROJECT_VIDEOS = {
    "ai-subtitle-extractor": "",
    "design-master": "",
    "gitlearnos": "",
    "word-snap": ""
  };

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

  document.querySelectorAll(".hub-actions[data-video-key]").forEach(function (slot) {
    var url = PROJECT_VIDEOS[slot.getAttribute("data-video-key")];
    if (!url) return;

    var link = document.createElement("a");
    link.className = "hub-action";
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("data-en", "Watch Demo");
    link.setAttribute("data-zh", "观看演示");
    link.textContent = currentLang === "zh" ? "观看演示" : "Watch Demo";
    slot.insertBefore(link, slot.firstChild);
  });

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

  /* Unified, equal-weight project grid: category filter + sort (newest / A-Z). */
  var grid = document.getElementById("project-grid");
  var cells = grid ? Array.prototype.slice.call(grid.querySelectorAll(".hub-cell")) : [];
  var activeFilter = "all";
  var activeSort = "new";

  function applyWorkView() {
    cells.forEach(function (cell) {
      var visible = activeFilter === "all" || cell.getAttribute("data-category") === activeFilter;
      cell.classList.toggle("is-hidden", !visible);
      cell.setAttribute("aria-hidden", visible ? "false" : "true");
    });
    var ordered = cells.slice().sort(function (a, b) {
      if (activeSort === "name") {
        return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"));
      }
      return b.getAttribute("data-date").localeCompare(a.getAttribute("data-date"));
    });
    ordered.forEach(function (cell) { grid.appendChild(cell); });
  }

  document.querySelectorAll(".filter[data-filter]").forEach(function (filterButton) {
    filterButton.setAttribute("aria-pressed", filterButton.classList.contains("is-active") ? "true" : "false");
    filterButton.addEventListener("click", function () {
      activeFilter = filterButton.getAttribute("data-filter");
      document.querySelectorAll(".filter[data-filter]").forEach(function (button) {
        var active = button === filterButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyWorkView();
    });
  });

  document.querySelectorAll(".sort[data-sort]").forEach(function (sortButton) {
    sortButton.addEventListener("click", function () {
      activeSort = sortButton.getAttribute("data-sort");
      document.querySelectorAll(".sort[data-sort]").forEach(function (button) {
        button.classList.toggle("is-active", button === sortButton);
      });
      applyWorkView();
    });
  });

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
