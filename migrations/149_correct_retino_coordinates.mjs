export const up = (db) => {
  const placeId = "pustosh-retino-1626-50";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Ретино'").get(placeId)) throw new Error("The Retino card was not found.");
  const longitude = 38 + 32 / 60 + 13.236 / 3600;
  const latitude = 59 + 18 / 60 + 50.466 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
