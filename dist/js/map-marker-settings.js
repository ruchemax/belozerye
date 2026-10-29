/* Shared marker settings for the home page and card maps. */
window.BelozeryeMapMarkers = Object.freeze({
  place: Object.freeze({
    diameter: 10,
    strokeWidth: 1.5,
    labelOffsetX: 8,
    fill: "#222",
    stroke: "#fff",
    labelColor: "#222"
  }),
  church: Object.freeze({
    iconWidth: 25,
    iconHeight: 25,
    iconScale: 0.0203,
    labelGap: 1,
    labelOffsetX: -14,
    labelOffsetY: -13,
    labelTextAlign: "right",
    labelColor: "#244864"
  }),
  labels: Object.freeze({
    underlineOnHover: true,
    font: "600 11px/1 system-ui, sans-serif",
    haloColor: "rgba(255,255,250,.95)",
    overlapColor: "#4b4034"
  }),
  active: Object.freeze({
    color: "#9a3412",
    labelSize: 14,
    zIndex: 20,
    overlayLayerClass: "map-marker-active-layer"
  }),
  clusters: Object.freeze({
    placeColor: "#242424",
    churchColor: "#365b73",
    stroke: "#fffaf0",
    zIndex: 10,
    overlayLayerClass: "map-marker-cluster-layer",
    overlaps(left, right) {
      return left.left < right.right && left.right > right.left
        && left.top < right.bottom && left.bottom > right.top;
    },
    group(items) {
      const used = new Set();
      const groups = [];
      for (let index = 0; index < items.length; index += 1) {
        if (used.has(index)) continue;
        const group = [index];
        used.add(index);
        for (let cursor = 0; cursor < group.length; cursor += 1) {
          const current = items[group[cursor]];
          for (let candidate = 0; candidate < items.length; candidate += 1) {
            const other = items[candidate];
            if (!used.has(candidate) && current.kind === other.kind && this.overlaps(current.iconBounds ?? current.bounds, other.iconBounds ?? other.bounds)) {
              used.add(candidate);
              group.push(candidate);
            }
          }
        }
        groups.push(group.map((itemIndex) => items[itemIndex]));
      }
      return groups;
    },
    setVectorLayerOrder(normalLayers, clusterLayers) {
      normalLayers.forEach((layer) => layer.setZIndex(0));
      clusterLayers.forEach((layer) => layer.setZIndex(this.zIndex));
    },
    createTopOverlayLayer(map, className = this.overlayLayerClass, zIndex = this.zIndex) {
      const layer = document.createElement("div");
      layer.className = className;
      layer.style.zIndex = String(zIndex);
      map.getViewport().append(layer);
      return layer;
    }
  })
});

(() => {
const markerSettings = window.BelozeryeMapMarkers;
const markerCssVariables = {
  "--map-place-diameter": `${markerSettings.place.diameter}px`,
  "--map-place-stroke-width": `${markerSettings.place.strokeWidth}px`,
  "--map-place-fill": markerSettings.place.fill,
  "--map-place-stroke": markerSettings.place.stroke,
  "--map-place-label-color": markerSettings.place.labelColor,
  "--map-church-width": `${markerSettings.church.iconWidth}px`,
  "--map-church-height": `${markerSettings.church.iconHeight}px`,
  "--map-church-label-color": markerSettings.church.labelColor,
  "--map-marker-label-font": markerSettings.labels.font,
  "--map-marker-label-halo": markerSettings.labels.haloColor,
  "--map-active-color": markerSettings.active.color,
  "--map-active-label-size": `${markerSettings.active.labelSize}px`,
  "--map-active-z-index": String(markerSettings.active.zIndex),
  "--map-cluster-place-color": markerSettings.clusters.placeColor,
  "--map-cluster-church-color": markerSettings.clusters.churchColor,
  "--map-cluster-stroke": markerSettings.clusters.stroke,
  "--map-cluster-z-index": String(markerSettings.clusters.zIndex)
};
for (const [name, value] of Object.entries(markerCssVariables)) document.documentElement.style.setProperty(name, value);
})();
