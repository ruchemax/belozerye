export const up = (db) => {
  const churchId = "andreya-pervozvannogo-charoma";
  const placeId = "charoma";
  const place = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(placeId);
  if (!place) throw new Error("The coordinates of Ilyinskoye were not found.");
  if (!db.prepare("SELECT 1 FROM churches WHERE id = ?").get(churchId)) throw new Error("The Andrew church card was not found.");

  const latitudeRadians = place.latitude * Math.PI / 180;
  const eccentricitySquared = 6.6943799901413165e-3;
  const meridianRadius = 6378137 * (1 - eccentricitySquared)
    / (1 - eccentricitySquared * Math.sin(latitudeRadians) ** 2) ** 1.5;
  const latitude = place.latitude - (100 / meridianRadius) * 180 / Math.PI;

  db.prepare("UPDATE churches SET location_place_id = ? WHERE id = ?").run(placeId, churchId);
  db.prepare(`
    INSERT INTO church_geometries (church_id, longitude, latitude, source)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(church_id) DO UPDATE SET
      longitude = excluded.longitude, latitude = excluded.latitude, source = excluded.source
  `).run(churchId, place.longitude, latitude, "100 м к югу от Ильинского по указанию пользователя");
};
