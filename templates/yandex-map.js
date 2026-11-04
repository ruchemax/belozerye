(() => {
  const apiKey = {{YANDEX_MAPS_API_KEY}};
  const createLayer = () => new ol.layer.Tile({source:new ol.source.XYZ({
    url:`https://tiles.api-maps.yandex.ru/v1/tiles/?x={x}&y={y}&z={z}&lang=ru_RU&l=map&projection=web_mercator&apikey=${encodeURIComponent(apiKey)}`
  })});
  const addAttribution = (map) => {
    const attribution = document.createElement("div");
    attribution.style.cssText = "position:absolute;right:0;bottom:0;z-index:1;display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:4px 8px;max-width:calc(100% - 8px);box-sizing:border-box;padding:2px 5px;border-radius:3px 0 0 0;background:rgba(255,255,255,.8);font:10px/1.2 Arial,sans-serif;color:#555";
    const makeLink = (href, label) => {
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      link.style.cssText = "color:#555;text-decoration:none;white-space:nowrap";
      return link;
    };
    const logoLink = makeLink("https://yandex.ru/maps/", "");
    logoLink.setAttribute("aria-label", "Яндекс Карты");
    const logo = document.createElement("img");
    logo.src = "https://yastatic.net/q/logoaas/v2/%D0%AF%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%20%D0%9A%D0%B0%D1%80%D1%82%D1%8B.svg";
    logo.alt = "Яндекс Карты";
    logo.style.cssText = "display:block;width:auto;height:15px";
    logoLink.append(logo);
    const openMaps = makeLink("https://yandex.ru/maps/", "Открыть в Картах");
    const terms = makeLink("https://yandex.ru/legal/maps_termsofuse/", "Условия");
    terms.style.textDecoration = "underline";
    attribution.append(logoLink, openMaps, terms);
    map.getViewport().append(attribution);
    const updateLink = () => {
      const center = map.getView().getCenter();
      if (!center) return;
      const [longitude,latitude] = ol.proj.toLonLat(center);
      const url = new URL("https://yandex.ru/maps/");
      url.searchParams.set("ll", `${longitude.toFixed(6)},${latitude.toFixed(6)}`);
      url.searchParams.set("z", String(Math.round(map.getView().getZoom() ?? 10)));
      openMaps.href = url.toString();
    };
    map.on("moveend", updateLink);
    updateLink();
    return attribution;
  };
  window.BelozeryeYandexMaps = {createLayer,addAttribution};
})();
