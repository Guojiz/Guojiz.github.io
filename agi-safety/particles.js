(() => {
  "use strict";

  const canvas = document.querySelector("#particle-canvas");
  const story = document.querySelector("#story");
  if (!canvas || !story) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const COLORS = {
    night: "#0b0d0c",
    human: "#f2a65a",
    ai: "#59b7ce",
    mirror: "#c84b35"
  };

  const STOPS = [0, 0.14, 0.29, 0.43, 0.57, 0.71, 0.85, 0.95];
  const SOVEREIGN_HUBS = [[0.2, 0.18], [0.54, 0.28], [0.78, 0.46]];
  const CONFIG = {
    human: { desktop: 720, mobile: 380, color: COLORS.human, size: 1.25 },
    ai: { desktop: 360, mobile: 190, color: COLORS.ai, size: 2.15 },
    mirror: { desktop: 150, mobile: 84, color: COLORS.mirror, size: 1.45 }
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const particles = [];
  const roleIndexes = { human: [], ai: [], mirror: [] };
  let targets = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let mobile = false;
  let progressTarget = 0;
  let progressCurrent = 0;
  let storyVisible = true;
  let lastTime = 0;
  let failureEcho = -1;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const power3InOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const fract = (value) => value - Math.floor(value);
  const hash = (index, salt) => fract(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123);

  function cluster(p, centers, spreadX, spreadY) {
    const center = centers[Math.floor(p.a * centers.length) % centers.length];
    const angle = p.b * Math.PI * 2;
    const radius = Math.sqrt(p.c);
    return [
      center[0] + Math.cos(angle) * radius * spreadX,
      center[1] + Math.sin(angle) * radius * spreadY
    ];
  }

  function humanTarget(p, state) {
    const original = cluster(p, [[0.25, 0.22], [0.43, 0.31], [0.31, 0.46], [0.56, 0.18]], 0.095, 0.075);
    if (state === 0) return [...original, 0.96, 1];
    if (state === 1) {
      const expanded = cluster(p, [[0.2, 0.2], [0.39, 0.34], [0.6, 0.18], [0.55, 0.49], [0.28, 0.52]], 0.105, 0.085);
      return [...expanded, 0.9, 0.95];
    }
    if (state === 2) {
      const dependent = cluster(p, SOVEREIGN_HUBS, 0.15, 0.11);
      return [...dependent, 0.42, 0.82];
    }
    if (state === 3) return [0.13 + p.a * 0.72, 0.14 + p.b * 0.44, 0.2, 0.64];
    if (state === 4) return [0.14 + p.a * 0.68, 0.18 + p.b * 0.4, 0.24, 0.7];
    if (state === 5) {
      const angle = p.a * Math.PI * 2;
      const speed = 0.1 + p.b * 0.24;
      return [0.64 + Math.cos(angle) * speed, 0.53 + Math.abs(Math.sin(angle)) * speed * 0.72, 0.36, 0.76];
    }
    if (state === 6) return [0.13 + p.a * 0.72, 0.53 + p.b * 0.19, 0.52, 0.82];

    const finalGroups = [[0.18, 0.31], [0.36, 0.23], [0.53, 0.37], [0.72, 0.25], [0.31, 0.5], [0.66, 0.51]];
    const final = cluster(p, finalGroups, 0.07, 0.055);
    return [...final, 0.98, 1.06];
  }

  function aiTarget(p, state) {
    if (state === 0) {
      const seed = cluster(p, [[0.32, 0.27], [0.48, 0.37]], 0.055, 0.045);
      return [...seed, 0.32, 0.7];
    }
    if (state === 1) {
      const route = cluster(p, [[0.18, 0.17], [0.36, 0.3], [0.58, 0.17], [0.67, 0.42], [0.29, 0.51]], 0.1, 0.065);
      return [...route, 0.8, 0.96];
    }
    if (state === 2) {
      if (p.d > 0.78) {
        const y = 0.08 + p.b * 0.57;
        return [0.04 + p.a * 0.92, y + Math.sin(p.a * 18 + p.b * 7) * 0.055, 0.92, 1.18];
      }
      const hub = SOVEREIGN_HUBS[Math.floor(p.a * SOVEREIGN_HUBS.length) % SOVEREIGN_HUBS.length];
      const angle = p.b * Math.PI * 2;
      const radius = 0.035 + p.c * 0.17;
      return [hub[0] + Math.cos(angle) * radius, hub[1] + Math.sin(angle) * radius * 0.68, 1, 1.42];
    }
    if (state === 3) return [0.03 + p.a * 0.94, 0.06 + p.b * 0.61, 1, 1.55];
    if (state === 4) {
      const y = 0.1 + p.b * 0.55;
      return [0.07 + p.a * 0.88, y + Math.sin(p.a * 14) * 0.035, 0.96, 1.35];
    }
    if (state === 5) {
      const x = 0.66 + (p.a - 0.5) * (0.055 + p.d * 0.08);
      return [x, 0.07 + p.b * 0.69, 1, 1.72];
    }
    if (state === 6) {
      const boundary = 0.46;
      if (p.a < 0.66) return [0.66 + (p.b - 0.5) * 0.11, boundary + 0.018 + p.c * 0.25, 0.98, 1.45];
      const collisionAngle = Math.PI * (0.08 + p.b * 0.84);
      const radius = 0.07 + p.c * 0.2;
      return [0.66 + Math.cos(collisionAngle) * radius, boundary + 0.012 + Math.abs(Math.sin(collisionAngle)) * radius * 0.7, 0.98, 1.45];
    }

    const centers = [[0.18, 0.31], [0.36, 0.23], [0.53, 0.37], [0.72, 0.25], [0.31, 0.5], [0.66, 0.51]];
    const center = centers[Math.floor(p.a * centers.length) % centers.length];
    const angle = p.b * Math.PI * 2;
    const radius = 0.1 + p.c * 0.085;
    return [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius * 0.7, 0.92, 1.15];
  }

  function mirrorTarget(p, state) {
    if (state < 4) return [0.5, 0.46, 0, 0.6];
    if (state === 4) {
      const y = 0.12 + p.b * 0.52;
      return [0.12 + p.a * 0.78, y + Math.sin(p.a * 16) * 0.03, 0.66, 0.85];
    }
    if (state === 5) return [0.28 + p.a * 0.65, 0.44 + (p.b - 0.5) * 0.075, 0.55, 0.95];
    if (state === 6) return [0.05 + p.a * 0.9, 0.46 + (p.b - 0.5) * 0.008, 1, 1.28];
    return [0.05 + p.a * 0.9, 0.59 + (p.b - 0.5) * 0.007, 0.48, 0.86];
  }

  function targetFor(particle, state) {
    if (particle.role === "human") return humanTarget(particle, state);
    if (particle.role === "ai") return aiTarget(particle, state);
    return mirrorTarget(particle, state);
  }

  function buildParticles() {
    particles.length = 0;
    Object.values(roleIndexes).forEach((indexes) => { indexes.length = 0; });
    Object.entries(CONFIG).forEach(([role, config], roleIndex) => {
      const count = mobile ? config.mobile : config.desktop;
      for (let index = 0; index < count; index += 1) {
        const seed = index + roleIndex * 5000;
        const particleIndex = particles.length;
        particles.push({
          role,
          local: index,
          a: hash(seed, 1),
          b: hash(seed, 2),
          c: hash(seed, 3),
          d: hash(seed, 4),
          e: hash(seed, 5),
          phase: hash(seed, 6) * Math.PI * 2
        });
        roleIndexes[role].push(particleIndex);
      }
    });

    targets = STOPS.map(() => new Float32Array(particles.length * 4));
    particles.forEach((particle, index) => {
      STOPS.forEach((_, state) => {
        const value = targetFor(particle, state);
        const offset = index * 4;
        targets[state][offset] = value[0];
        targets[state][offset + 1] = value[1];
        targets[state][offset + 2] = value[2];
        targets[state][offset + 3] = value[3];
      });
    });
  }

  function stateBlend(progress) {
    if (progress >= STOPS[STOPS.length - 1]) return [STOPS.length - 1, STOPS.length - 1, 0];
    let from = 0;
    while (from < STOPS.length - 2 && progress >= STOPS[from + 1]) from += 1;
    const raw = clamp((progress - STOPS[from]) / (STOPS[from + 1] - STOPS[from]));
    const transition = power3InOut(clamp((raw - 0.34) / 0.66));
    return [from, from + 1, transition];
  }

  function sceneWeight(scene, from, to, blend) {
    if (from === scene) return 1 - blend;
    if (to === scene) return blend;
    return 0;
  }

  function resize() {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    const nextMobile = nextWidth < 760;
    const rebuild = nextMobile !== mobile || particles.length === 0;
    mobile = nextMobile;
    width = nextWidth;
    height = nextHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.3 : 1.6);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (rebuild) buildParticles();
  }

  function drawGrid(visibility = 1) {
    ctx.save();
    ctx.strokeStyle = `rgba(89,183,206,${0.055 * visibility})`;
    ctx.lineWidth = 1;
    const stepX = Math.max(88, width / 8);
    const stepY = Math.max(84, height / 7);
    for (let x = stepX; x < width; x += stepX) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = stepY; y < height; y += stepY) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawDominance(weight) {
    if (weight < 0.01) return;
    const gradient = ctx.createRadialGradient(width * 0.55, height * 0.32, 0, width * 0.55, height * 0.32, width * 0.68);
    gradient.addColorStop(0, `rgba(17,101,139,${0.24 * weight})`);
    gradient.addColorStop(0.58, `rgba(8,59,88,${0.16 * weight})`);
    gradient.addColorStop(1, "rgba(11,13,12,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawSovereigntyDrivers(weight, time) {
    if (weight < 0.01) return;
    const hubs = SOVEREIGN_HUBS.map(([x, y]) => [x * width, y * height]);
    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = `rgba(89,183,206,${0.2 * weight})`;

    for (let index = 0; index < hubs.length - 1; index += 1) {
      ctx.beginPath();
      ctx.moveTo(hubs[index][0], hubs[index][1]);
      ctx.lineTo(hubs[index + 1][0], hubs[index + 1][1]);
      ctx.stroke();
    }

    hubs.forEach(([x, y], hubIndex) => {
      for (let ray = 0; ray < 7; ray += 1) {
        const angle = hubIndex * 1.9 + ray * 0.9;
        const reach = Math.min(width, height) * (0.11 + ray * 0.012);
        ctx.globalAlpha = weight * (0.09 + ray * 0.008);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach * 0.66);
        ctx.stroke();
      }

      ctx.globalAlpha = weight * 0.52;
      ctx.strokeStyle = COLORS.ai;
      ctx.beginPath();
      ctx.arc(x, y, 8 + hubIndex * 2, 0, Math.PI * 2);
      ctx.stroke();

      const pulse = fract(time * (0.42 + hubIndex * 0.08));
      ctx.globalAlpha = weight * (1 - pulse) * 0.24;
      ctx.beginPath();
      ctx.arc(x, y, 12 + pulse * 32, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawAscent(weight) {
    if (weight < 0.01) return;
    const x = width * 0.66;
    const gradient = ctx.createLinearGradient(x - width * 0.07, 0, x + width * 0.07, 0);
    gradient.addColorStop(0, "rgba(89,183,206,0)");
    gradient.addColorStop(0.5, `rgba(89,183,206,${0.18 * weight})`);
    gradient.addColorStop(1, "rgba(89,183,206,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - width * 0.08, height * 0.04, width * 0.16, height * 0.72);
    ctx.strokeStyle = `rgba(159,226,241,${0.58 * weight})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, height * 0.76); ctx.lineTo(x, height * 0.04); ctx.stroke();
  }

  function drawBoundary(weight, finalWeight, failure) {
    const total = Math.max(weight, finalWeight * 0.42) * (1 - failure);
    if (total < 0.01) return;
    const y = height * lerp(0.46, 0.59, finalWeight);
    ctx.save();
    ctx.shadowColor = COLORS.mirror;
    ctx.shadowBlur = 18 * total;
    ctx.strokeStyle = `rgba(200,75,53,${0.78 * total})`;
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(width * 0.04, y); ctx.lineTo(width * 0.96, y); ctx.stroke();
    ctx.shadowBlur = 0;
    if (weight > 0.02) {
      ctx.strokeStyle = `rgba(89,183,206,${0.24 * weight})`;
      for (let ring = 0; ring < 4; ring += 1) {
        ctx.beginPath();
        ctx.arc(width * 0.66, y + 10, 18 + ring * 18, Math.PI * 0.08, Math.PI * 0.92);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawHumanLinks(points, weight) {
    if (weight < 0.05 || points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = `rgba(242,166,90,${0.12 * weight})`;
    ctx.lineWidth = 0.7;
    for (let index = 0; index < points.length - 13; index += 13) {
      const a = points[index];
      const b = points[index + 13];
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      if (dx * dx + dy * dy < 18000) {
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function motion(particle, state, time) {
    if (reducedMotion) return [0, 0];
    if (particle.role === "human") {
      const amplitude = state === 5 ? 0.006 : 0.002;
      return [Math.sin(time * 0.55 + particle.phase) * amplitude, Math.cos(time * 0.42 + particle.phase) * amplitude];
    }
    if (particle.role === "mirror") return [Math.sin(time * 0.35 + particle.phase) * 0.0015, 0];
    const final = state === 7;
    const accelerated = state === 2 || state === 3;
    const speed = final ? 4.2 : accelerated ? 5.4 : 1.7;
    const amplitude = final ? 0.018 : accelerated ? 0.014 : 0.007;
    return [Math.cos(time * speed + particle.phase) * amplitude, Math.sin(time * speed + particle.phase) * amplitude * 0.62];
  }

  function failureWeight(from, to, blend) {
    if (from !== 6 || to !== 7) return 0;
    return Math.pow(Math.sin(Math.PI * blend), 6);
  }

  function drawParticles(from, to, blend, time) {
    const humanPoints = [];
    const state = blend < 0.5 ? from : to;
    const failure = failureWeight(from, to, blend);
    ["human", "ai", "mirror"].forEach((role) => {
      const config = CONFIG[role];
      const roleFade = role === "human" ? 1 : 1 - failure * 0.995;
      const indexes = roleIndexes[role];
      ctx.fillStyle = config.color;
      indexes.forEach((index) => {
        const particle = particles[index];
        const offset = index * 4;
        const movement = motion(particle, state, time);
        const stagger = from === to ? 0 : power3InOut(clamp((blend - particle.e * 0.11) / 0.89));
        const x = (lerp(targets[from][offset], targets[to][offset], stagger) + movement[0]) * width;
        const y = (lerp(targets[from][offset + 1], targets[to][offset + 1], stagger) + movement[1]) * height;
        const alpha = lerp(targets[from][offset + 2], targets[to][offset + 2], stagger) * roleFade;
        const scale = lerp(targets[from][offset + 3], targets[to][offset + 3], stagger);
        if (alpha < 0.015 || x < -20 || x > width + 20 || y < -20 || y > height + 20) return;

        if (role === "human" && particle.local % 8 === 0) humanPoints.push([x, y]);
        const radius = Math.max(0.6, config.size * scale * (0.66 + particle.e * 0.72));
        const visibleAlpha = alpha * (0.55 + particle.d * 0.45);
        const glowThreshold = role === "ai" ? 0.9 : role === "human" ? 0.94 : 0.88;
        if (!mobile && particle.e > glowThreshold) {
          ctx.globalAlpha = visibleAlpha * 0.13;
          ctx.beginPath(); ctx.arc(x, y, radius * 3.1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = visibleAlpha;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    });
    drawHumanLinks(humanPoints, sceneWeight(0, from, to, blend) + sceneWeight(7, from, to, blend));
  }

  function render(timeMs) {
    const time = timeMs * 0.001;
    const deltaSeconds = lastTime ? Math.min(0.05, (timeMs - lastTime) / 1000) : 1 / 60;
    lastTime = timeMs;
    if (!reducedMotion) {
      const scrub = 1 - Math.exp(-deltaSeconds / (mobile ? 0.34 : 0.42));
      progressCurrent = lerp(progressCurrent, progressTarget, scrub);
      if (Math.abs(progressTarget - progressCurrent) < 0.00002) progressCurrent = progressTarget;
    } else progressCurrent = progressTarget;

    ctx.fillStyle = COLORS.night;
    ctx.fillRect(0, 0, width, height);

    const [from, to, blend] = stateBlend(progressCurrent);
    const dominance = sceneWeight(2, from, to, blend) * 0.76 + sceneWeight(3, from, to, blend);
    const sovereigntyDrivers = sceneWeight(2, from, to, blend) + sceneWeight(3, from, to, blend) * 0.42;
    const ascent = sceneWeight(5, from, to, blend);
    const boundary = sceneWeight(6, from, to, blend);
    const final = sceneWeight(7, from, to, blend);
    const failure = failureWeight(from, to, blend);
    drawGrid(1 - failure);
    if (Math.abs(failure - failureEcho) > 0.01 || failure === 0 || failure === 1) {
      story.style.setProperty("--failure-echo", failure.toFixed(3));
      failureEcho = failure;
    }
    drawDominance(dominance);
    drawSovereigntyDrivers(sovereigntyDrivers, time);
    drawAscent(ascent);
    drawParticles(from, to, blend, time);
    drawBoundary(boundary, final, failure);

    if (storyVisible) window.requestAnimationFrame(render);
  }

  window.ParticleStory = {
    setProgress(value) {
      progressTarget = clamp(Number(value) || 0);
      if (reducedMotion) progressCurrent = progressTarget;
    }
  };

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (storyVisible) window.requestAnimationFrame(render);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const wasVisible = storyVisible;
      storyVisible = entries[0]?.isIntersecting ?? true;
      if (storyVisible && !wasVisible) window.requestAnimationFrame(render);
    }, { rootMargin: "100px 0px" });
    observer.observe(story);
  }

  resize();
  progressCurrent = progressTarget;
  window.requestAnimationFrame(render);
})();
