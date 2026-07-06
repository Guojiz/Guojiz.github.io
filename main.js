// Project Register — language switching + light motion.
(function () {
  "use strict";

  var STORAGE_KEY = "guojiz.lang";
  var DEFAULT_LANG = "en"; // English first.
  var LANGS = ["en", "zh"];

  var TITLES = {
    en: "Guojiz — Project Register",
    zh: "Guojiz — 项目登记册"
  };
  var META = {
    en: "Guojiz's project register: AI learning systems, a Claude Desktop model patch, and a word-practice tool. AGI safety research is pending.",
    zh: "Guojiz 的项目登记册：AI 学习系统、Claude Desktop 模型补丁和单词练习工具。AGI safety research 暂未开放。"
  };

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
      } else {
        el.innerHTML = val;
      }
    }

    document.title = TITLES[lang];
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", META[lang]);

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
