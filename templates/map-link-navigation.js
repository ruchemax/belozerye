(() => {
  window.BelozeryeMapLinkNavigation = (map, { rootPrefix, isEnabled = () => true }) => {
    const viewport = map.getViewport();
    const link = document.createElement("a");
    link.className = "map-object-link";
    link.hidden = true;
    link.draggable = false;
    link.tabIndex = -1;
    link.style.cssText = "position:absolute;z-index:5;width:24px;height:24px;margin:0;padding:0;border:0;background:transparent;cursor:pointer";
    viewport.append(link);
    const hide = () => { link.hidden = true; link.removeAttribute("href"); };
    map.on("pointermove", (event) => {
      if (event.dragging || !isEnabled()) { hide(); return; }
      const feature = map.forEachFeatureAtPixel(event.pixel, (candidate) => candidate, { hitTolerance: 6 });
      const members = feature?.get("features") ?? [];
      if (members.length !== 1 || !members[0].get("slug")) { hide(); return; }
      const marker = members[0];
      const directory = marker.get("kind") === "church" ? "churches" : "places";
      link.href = `${rootPrefix}${directory}/${encodeURIComponent(marker.get("slug"))}/`;
      link.setAttribute("aria-label", `Открыть страницу: ${marker.get("name")}`);
      link.style.left = `${event.pixel[0] - 12}px`;
      link.style.top = `${event.pixel[1] - 12}px`;
      link.hidden = false;
    });
    viewport.addEventListener("pointerleave", hide);
    map.on("movestart", hide);
    map.on("pointerdrag", hide);
    link.addEventListener("dragstart", (event) => event.preventDefault());
    return { hide };
  };
})();
