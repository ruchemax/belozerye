export const up = (db) => {
  const placeId = "drozdovo";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Drozdovo card was not found.");
  const longitude = 38 + 30 / 60 + 48.054 / 3600;
  const latitude = 59 + 14 / 60 + 33.298 / 3600;
  db.prepare(`
    INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude
  `).run(placeId, longitude, latitude);
};
