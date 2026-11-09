(() => {
  if (new URLSearchParams(location.search).get("embed") === "1") return;

  const navigationType = performance.getEntriesByType("navigation")[0]?.type;
  const storageKey = () => `belozerye:book-reading:${location.pathname}:${location.hash}`;
  const controls = () => {
    const occurrences = new Map();
    return [...document.querySelectorAll("button.heading-toggle[aria-expanded]")].map((button) => {
      const entry = button.closest("[data-contents-entry]");
      const heading = button.closest("h1,h2,h3,h4,h5,h6");
      const base = button.hasAttribute("data-contents-toggle") ? "contents"
        : entry ? `contents:${entry.dataset.contentsKey ?? entry.querySelector("a")?.getAttribute("href")}`
        : button.hasAttribute("aria-controls") ? `panel:${button.getAttribute("aria-controls")}`
        : `heading:${heading?.id || [...document.querySelectorAll(".document-body h1,.document-body h2,.document-body h3,.document-body h4")].indexOf(heading)}`;
      const occurrence = occurrences.get(base) ?? 0;
      occurrences.set(base, occurrence + 1);
      return [`${base}:${occurrence}`, button];
    });
  };

  let saved;
  if (navigationType === "reload" || navigationType === "back_forward") {
    try { saved = JSON.parse(sessionStorage.getItem(storageKey())); } catch {}
  }
  let restoring = Number.isFinite(saved?.y);
  let timers = [];
  const save = () => {
    if (restoring) return;
    try {
      sessionStorage.setItem(storageKey(), JSON.stringify({
        x: scrollX, y: scrollY,
        controls: controls().map(([key, button]) => [key, button.getAttribute("aria-expanded") === "true"])
      }));
    } catch {}
  };
  const scrollToHash = () => {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const headerHeight = document.querySelector("body > header")?.getBoundingClientRect().height ?? 0;
    scrollTo({ top: Math.max(0, scrollY + target.getBoundingClientRect().top - headerHeight - 32), behavior: "instant" });
  };

  if (restoring) {
    history.scrollRestoration = "manual";
    const expanded = new Map(saved.controls ?? []);
    for (const [key, button] of controls()) {
      if (expanded.has(key) && expanded.get(key) !== (button.getAttribute("aria-expanded") === "true")) button.click();
    }
  }
  const initialize = () => {
    if (restoring) {
      const restore = () => {
        if (restoring) scrollTo({ top: saved.y, left: saved.x ?? 0, behavior: "instant" });
      };
      requestAnimationFrame(() => requestAnimationFrame(restore));
      timers = [150, 500].map(delay => setTimeout(restore, delay));
      timers.push(setTimeout(() => { restoring = false; save(); }, 550));
    } else if (navigationType !== "reload" && navigationType !== "back_forward") {
      requestAnimationFrame(() => requestAnimationFrame(scrollToHash));
      timers = [setTimeout(scrollToHash, 150)];
    }
  };
  if (document.readyState === "complete") initialize();
  else addEventListener("load", initialize, { once: true });

  const stopRestoring = () => {
    timers.forEach(clearTimeout);
    restoring = false;
  };
  for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    addEventListener(event, stopRestoring, { passive: true });
  }
  let scheduled = false;
  addEventListener("scroll", () => {
    if (scheduled || restoring) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; save(); });
  }, { passive: true });
  document.addEventListener("click", (event) => {
    if (event.target.closest("button.heading-toggle")) queueMicrotask(save);
  });
  addEventListener("pagehide", save);
  addEventListener("hashchange", () => {
    stopRestoring();
    requestAnimationFrame(() => requestAnimationFrame(scrollToHash));
    timers = [setTimeout(scrollToHash, 150)];
  });
})();
