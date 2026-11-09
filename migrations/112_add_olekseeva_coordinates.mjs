export const up = (db) => {
  const placeId = "derevnya-olekseeva-1626-7";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Olekseeva card was not found.");
  const longitude = 38 + 36 / 60 + 37.088 / 3600;
  const latitude = 59 + 20 / 60 + 35.985 / 3600;
  db.prepare(`
    INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude
  `).run(placeId, longitude, latitude);
};
