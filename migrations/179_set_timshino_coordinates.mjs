export const up = (db) => {
  const placeId = "pustosh-timshino-1626-106";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Тимшино'").get(placeId)) {
    throw new Error("The Timshino card was not found.");
  }
  const longitude = 38 + 39 / 60 + 30.568 / 3600;
  const latitude = 59 + 20 / 60 + 50.119 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
