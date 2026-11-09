export const up = (db) => {
  const churchId = "kirilla-belozerskogo-pishchalinskoe";
  const placeId = "pishchalinskoe";
  const point = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(placeId);
  if (!point || !db.prepare("SELECT 1 FROM churches WHERE id = ? AND location_place_id = ?").get(churchId, placeId)) {
    throw new Error("The Kolenechsky pogost or its church was not found.");
  }
  const latitudeRadians = point.latitude * Math.PI / 180;
  const eccentricitySquared = 6.69437999014e-3;
  const meridionalRadius = 6378137 * (1 - eccentricitySquared)
    / (1 - eccentricitySquared * Math.sin(latitudeRadians) ** 2) ** 1.5;
  const northOffset = 100 / meridionalRadius * 180 / Math.PI;
  db.prepare(`INSERT INTO church_geometries (church_id, longitude, latitude, source) VALUES (?, ?, ?, ?)
    ON CONFLICT(church_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude, source = excluded.source`)
    .run(churchId, point.longitude, point.latitude + northOffset,
      "смещение на 100 м к северу от Коленецкого погоста для отображения на карте");
};
