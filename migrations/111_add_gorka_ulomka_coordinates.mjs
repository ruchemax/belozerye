export const up = (db) => {
  const placeId = "derevnya-gorka-na-rechke-na-ulomke-1626-4";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Gorka on the Ulomka card was not found.");
  const longitude = 38 + 38 / 60 + 0.624 / 3600;
  const latitude = 59 + 23 / 60 + 27.37 / 3600;
  db.prepare(`
    INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude
  `).run(placeId, longitude, latitude);
};
