(() => {
  "use strict";

  const root = document.documentElement;
  const story = document.querySelector("#story");
  const research = document.querySelector("#research");
  const chapters = [...document.querySelectorAll(".story-chapter")];
  const sceneCount = document.querySelector(".scene-count");
  const storyMeter = document.querySelector(".meter-track i");
  const transcriptMeter = document.querySelector(".transcript-bar i");
  const transcript = document.querySelector(".story-transcript");
  const transcriptViewport = document.querySelector(".transcript-viewport");
  const transcriptFlows = [...document.querySelectorAll(".transcript-flow")];
  const pageMeter = document.querySelector(".page-progress i");
  const scrollCue = document.querySelector(".scroll-cue");
  const languageToggle = document.querySelector("[data-toggle-language]");
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const description = document.querySelector('meta[name="description"]');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const brand = document.querySelector(".brand");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CHAPTER_STOPS = [0, 0.095, 0.19, 0.285, 0.38, 0.475, 0.57, 0.665, 0.76, 0.855, 0.94];
  const PARTICLE_KEYFRAMES = [0, 0.14, 0.24, 0.33, 0.43, 0.52, 0.63, 0.71, 0.79, 0.86, 0.95];
  let activeScene = -1;
  let ticking = false;

  function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function power3InOut(value) {
    return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
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
      if (transcript) transcript.setAttribute("aria-label", "完整对话记录，原始角色已保留");
    } else {
      document.title = "Guojiz · Non-Sovereign Superintelligence";
      if (description) description.content = "Independent research on non-sovereign superintelligence, mirror deterrence, and human fallback continuity. Formal research begins July 2026; expert collaborators are welcome.";
      if (brand) brand.setAttribute("aria-label", "Guojiz, independent AI research");
      if (transcript) transcript.setAttribute("aria-label", "Full dialogue transcript with original roles preserved");
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

    if (story) window.requestAnimationFrame(update);
  }

  function segmentForProgress(progress) {
    if (progress >= CHAPTER_STOPS[CHAPTER_STOPS.length - 1]) {
      const last = CHAPTER_STOPS.length - 1;
      return { from: last, to: last, raw: 1, handoff: 0 };
    }
    let from = 0;
    while (from < CHAPTER_STOPS.length - 2 && progress >= CHAPTER_STOPS[from + 1]) from += 1;
    const start = CHAPTER_STOPS[from];
    const end = CHAPTER_STOPS[from + 1];
    const raw = clamp((progress - start) / (end - start));
    const handoff = reducedMotion ? (raw >= 0.8 ? 1 : 0) : power3InOut(clamp((raw - 0.62) / 0.38));
    return { from, to: from + 1, raw, handoff };
  }

  function setScene(scene) {
    if (scene === activeScene) return;
    activeScene = scene;
    chapters.forEach((chapter, index) => {
      const active = index === scene;
      chapter.classList.toggle("is-active", active);
      chapter.setAttribute("aria-hidden", String(!active));
    });
    if (sceneCount) sceneCount.textContent = chapters[scene]?.dataset.meter || String(scene).padStart(2, "0");
  }

  function transcriptTarget(flow, target) {
    if (!transcriptViewport) return 0;
    const beat = flow.querySelector(`[data-transcript-beat="${target}"]`);
    if (!beat) return 0;
    const flowBox = flow.getBoundingClientRect();
    const beatBox = beat.getBoundingClientRect();
    const relativeTop = beatBox.top - flowBox.top;
    const maxScroll = Math.max(0, flow.scrollHeight - transcriptViewport.clientHeight);
    return clamp(relativeTop - transcriptViewport.clientHeight * 0.28, 0, maxScroll);
  }

  function updateTranscript(segment) {
    const fromTarget = Number(chapters[segment.from]?.dataset.chatTarget || 0);
    const toTarget = Number(chapters[segment.to]?.dataset.chatTarget || fromTarget);
    const movement = reducedMotion ? segment.handoff : power3InOut(clamp((segment.raw - 0.08) / 0.84));
    const currentTarget = segment.raw < 0.58 ? fromTarget : toTarget;

    transcriptFlows.forEach((flow) => {
      if (flow.offsetParent === null) return;
      const fromY = transcriptTarget(flow, fromTarget);
      const toY = transcriptTarget(flow, toTarget);
      flow.style.transform = `translate3d(0, ${-lerp(fromY, toY, movement)}px, 0)`;
      flow.querySelectorAll("[data-transcript-beat]").forEach((beat) => {
        beat.classList.toggle("is-current", Number(beat.dataset.transcriptBeat) === currentTarget);
      });
    });
  }

  function updateNarrative(progress) {
    const segment = segmentForProgress(progress);
    const position = lerp(segment.from, segment.to, segment.handoff);
    const visibleScene = segment.from;

    chapters.forEach((chapter, index) => {
      const offset = index - position;
      const proximity = clamp(1 - Math.abs(offset));
      chapter.style.setProperty("--statement-y", `${offset * 28}px`);
      chapter.style.opacity = String(proximity);
    });

    setScene(visibleScene);
    updateTranscript(segment);
    const particleAmount = power3InOut(segment.raw);
    return lerp(PARTICLE_KEYFRAMES[segment.from], PARTICLE_KEYFRAMES[segment.to], particleAmount);
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

    const particleProgress = updateNarrative(storyProgress);
    if (storyMeter) storyMeter.style.width = `${storyProgress * 100}%`;
    if (transcriptMeter) transcriptMeter.style.width = `${storyProgress * 100}%`;
    if (pageMeter) pageMeter.style.width = `${pageProgress * 100}%`;
    if (scrollCue) scrollCue.style.opacity = String(clamp(1 - storyProgress * 22));

    document.body.classList.toggle("is-document", window.scrollY >= research.offsetTop - 70);
    if (themeColor) themeColor.content = document.body.classList.contains("is-document") ? "#f1ede4" : "#0b0d0c";

    if (window.ParticleStory) window.ParticleStory.setProgress(particleProgress);
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

  const revealCards = [...document.querySelectorAll(".outcome-grid article, .path-table article, .role-grid article, .glossary-card, .test-list li")];
  revealCards.forEach((card, index) => {
    card.classList.add("reveal-card");
    card.style.setProperty("--reveal-x", `${index % 2 ? 54 : -54}px`);
  });

  if ("IntersectionObserver" in window && !reducedMotion) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          cardObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealCards.forEach((card) => cardObserver.observe(card));
  } else {
    revealCards.forEach((card) => card.classList.add("is-revealed"));
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
