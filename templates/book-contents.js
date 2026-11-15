(() => {
  const contents = document.getElementById("document-contents");
  if (!contents) return;
  const entries = [...contents.querySelectorAll("[data-contents-entry]")];
  const buttons = new Map(entries.map((entry) => [entry,
    entry.querySelector("[data-contents-level-toggle]:not([aria-controls])")]));
  const managed = new Set();
  const update = () => {
    const parents = [];
    for (const entry of entries) {
      const level = Number(entry.dataset.contentsLevel);
      const boundary = parents.findIndex((parent) => parent.endKey && parent.endKey === entry.dataset.contentsKey);
      if (boundary !== -1) parents.splice(boundary);
      while (parents.length && parents.at(-1).level >= level) parents.pop();
      if (parents.length || managed.has(entry)) {
        entry.hidden = parents.some(({ button }) => button.getAttribute("aria-expanded") === "false");
        managed.add(entry);
      }
      const button = buttons.get(entry);
      if (button) parents.push({ level, button, endKey: entry.dataset.contentsEnd });
    }
  };
  for (const button of buttons.values()) {
    if (!button) continue;
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.setAttribute("aria-label", expanded ? "Показать подразделы" : "Свернуть подразделы");
      update();
    });
  }
  update();
})();
