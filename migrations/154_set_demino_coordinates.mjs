export const up = (db) => {
  const placeId = "pustosh-demino-1626-64";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Демино'").get(placeId)) {
    throw new Error("The Demino card was not found.");
  }
  const longitude = 38 + 39 / 60 + 49.636 / 3600;
  const latitude = 59 + 20 / 60 + 6.532 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
