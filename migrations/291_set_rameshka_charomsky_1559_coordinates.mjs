export const up = (db) => {
  const placeId = "rameshka-charomsky-1559";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error(`Place not found: ${placeId}`);
  }
  const longitude = 38 + 40 / 60 + 49.216 / 3600;
  const latitude = 59 + 19 / 60 + 9.93 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
