(() => {
  "use strict";

  const root = document.documentElement;
  const story = document.querySelector("#story");
  const research = document.querySelector("#research");
  const chapters = [...document.querySelectorAll(".story-chapter")];
  const sceneCount = document.querySelector(".scene-count");
  const storyMeter = document.querySelector(".meter-track i");
  const pageMeter = document.querySelector(".page-progress i");
  const scrollCue = document.querySelector(".scroll-cue");
  const languageToggle = document.querySelector("[data-toggle-language]");
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const description = document.querySelector('meta[name="description"]');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const brand = document.querySelector(".brand");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CHAPTER_STOPS = [0, 0.14, 0.29, 0.43, 0.57, 0.71, 0.85, 0.95];
  let activeScene = -1;
  let ticking = false;

  function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
  }

  function setLanguage(language, updateUrl = true) {
    const next = language === "en" ? "en" : "zh";
    root.dataset.language = next;
    root.lang = next === "zh" ? "zh-CN" : "en";

    if (languageToggle) {
      languageToggle.textContent = next === "en" ? "中文" : "English";
      languageToggle.setAttribute("aria-label", next === "en" ? "切换到中文" : "Switch to English");
    }

    if (next === "zh") {
      document.title = "郭己正 · 非主权超级智能";
      if (description) description.content = "郭己正关于非主权超级智能、镜像威慑与人类备用连续性的独立研究。2026 年 7 月正式启动，欢迎专家学者合作。";
      if (brand) brand.setAttribute("aria-label", "郭己正，独立人工智能研究");
    } else {
      document.title = "Guojiz · Non-Sovereign Superintelligence";
      if (description) description.content = "Independent research on non-sovereign superintelligence, mirror deterrence, and human fallback continuity. Formal research begins July 2026; expert collaborators are welcome.";
      if (brand) brand.setAttribute("aria-label", "Guojiz, independent AI research");
    }

    try {
      localStorage.setItem("guojiz-language-v2", next);
      if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", next);
        window.history.replaceState({}, "", url);
      }
    } catch (_) {
      // The language switch still works when storage or history is unavailable.
    }
  }

  function sceneForProgress(progress) {
    let scene = 0;
    for (let index = 1; index < CHAPTER_STOPS.length; index += 1) {
      if (progress >= CHAPTER_STOPS[index]) scene = index;
    }
    return scene;
  }

  function setScene(scene) {
    if (scene === activeScene) return;
    activeScene = scene;
    chapters.forEach((chapter, index) => {
      const active = index === scene;
      chapter.classList.toggle("is-active", active);
      chapter.setAttribute("aria-hidden", String(!active));
    });
    if (sceneCount) sceneCount.textContent = String(scene).padStart(2, "0");
  }

  function scrollToScene(scene) {
    if (!story || !research) return;
    const targetScene = Math.max(0, Math.min(CHAPTER_STOPS.length - 1, scene));
    const storyDistance = Math.max(1, story.offsetHeight - window.innerHeight);
    const top = story.offsetTop + CHAPTER_STOPS[targetScene] * storyDistance;
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }

  function update() {
    if (!story || !research) return;

    const storyStart = story.offsetTop;
    const storyDistance = Math.max(1, story.offsetHeight - window.innerHeight);
    const storyProgress = clamp((window.scrollY - storyStart) / storyDistance);
    const pageDistance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = clamp(window.scrollY / pageDistance);

    setScene(sceneForProgress(storyProgress));
    if (storyMeter) storyMeter.style.width = `${storyProgress * 100}%`;
    if (pageMeter) pageMeter.style.width = `${pageProgress * 100}%`;
    if (scrollCue) scrollCue.style.opacity = String(clamp(1 - storyProgress * 18));

    document.body.classList.toggle("is-document", window.scrollY >= research.offsetTop - 70);
    if (themeColor) themeColor.content = document.body.classList.contains("is-document") ? "#f1ede4" : "#0b0d0c";

    if (window.ParticleStory) window.ParticleStory.setProgress(storyProgress);
    ticking = false;
  }

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      setLanguage(root.dataset.language === "en" ? "zh" : "en");
    });
  }

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (!story || !research || window.scrollY >= research.offsetTop - 24) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target;
    if (target instanceof HTMLElement && target.closest("button, a, input, textarea, select, [contenteditable='true']")) return;

    const forward = ["ArrowDown", "ArrowRight", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey);
    const backward = ["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey);
    if (!forward && !backward && event.key !== "Home" && event.key !== "End") return;

    event.preventDefault();
    if (event.key === "Home") scrollToScene(0);
    else if (event.key === "End") scrollToScene(CHAPTER_STOPS.length - 1);
    else if (forward && activeScene >= CHAPTER_STOPS.length - 1) {
      window.scrollTo({ top: research.offsetTop, behavior: reducedMotion ? "auto" : "smooth" });
    } else {
      scrollToScene(activeScene + (forward ? 1 : -1));
    }
  });

  if ("IntersectionObserver" in window && navLinks.length) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const href = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === href) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-25% 0px -68% 0px", threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  let initialLanguage = "en";
  try {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const stored = localStorage.getItem("guojiz-language-v2");
    if (requested === "zh" || requested === "en") initialLanguage = requested;
    else if (stored === "zh" || stored === "en") initialLanguage = stored;
  } catch (_) {
    initialLanguage = "en";
  }

  setLanguage(initialLanguage, false);
  setScene(0);
  update();
})();
