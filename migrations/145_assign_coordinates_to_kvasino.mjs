export const up = (db) => {
  const placeId = "pustosh-kvasino-1626-51";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Kvasino card was not found.");
  const longitude = 38 + 32 / 60 + 12.436 / 3600;
  const latitude = 59 + 18 / 60 + 50.84 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
  db.prepare(`DELETE FROM place_geometries WHERE place_id = 'pustosh-retino-1626-50'
    AND abs(longitude - ?) < 0.000000001 AND abs(latitude - ?) < 0.000000001`)
    .run(longitude, latitude);
};
