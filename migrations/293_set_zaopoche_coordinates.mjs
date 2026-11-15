export const up = (db) => {
  const placeId = "zaopoche";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error(`Place not found: ${placeId}`);
  }
  const longitude = 38 + 22 / 60 + 22.151 / 3600;
  const latitude = 59 + 6 / 60 + 50.807 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
