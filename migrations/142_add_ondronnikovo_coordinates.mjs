export const up = (db) => {
  const placeId = "pustosh-ondronnikovo-1626-49";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Ondronnikovo card was not found.");
  const longitude = 38 + 31 / 60 + 11.735 / 3600;
  const latitude = 59 + 18 / 60 + 38.583 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
