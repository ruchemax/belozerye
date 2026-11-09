export const up = (db) => {
  const placeId = "na-shchuche";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("The Pochinok na Shchuche place was not found.");
  }
  db.prepare(`
    INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude
  `).run(placeId, 38.612751, 59.496632);
};
