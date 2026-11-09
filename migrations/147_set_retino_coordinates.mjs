export const up = (db) => {
  const placeId = "pustosh-retino-1626-50";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Ретино'").get(placeId)) throw new Error("The Retino card was not found.");
  const longitude = 38 + 33 / 60 + 0.135 / 3600;
  const latitude = 59 + 19 / 60 + 4.3 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
