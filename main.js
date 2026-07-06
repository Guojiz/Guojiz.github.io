// Project Register — light motion only, respects reduced motion.
(function () {
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

  // Hero stagger.
  document.querySelectorAll("[data-rise]").forEach(function (el, i) {
    el.style.setProperty("--i", i);
    el.classList.add("rise");
  });

  // Scroll reveal for register entries.
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
