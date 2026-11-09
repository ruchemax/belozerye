export const up = (db) => {
  const placeId = "pustosh-mishkino-1626-62";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Мишкино'").get(placeId)) {
    throw new Error("The Mishkino card was not found.");
  }
  const longitude = 38 + 35 / 60 + 54.283 / 3600;
  const latitude = 59 + 21 / 60 + 31.148 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
