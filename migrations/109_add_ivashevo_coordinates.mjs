export const up = (db) => {
  const placeId = "derevnya-ivashevo-na-rechke-na-ulolmke-1626-2";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Ivashevo card was not found.");
  const longitude = 38 + 34 / 60 + 2.972 / 3600;
  const latitude = 59 + 23 / 60 + 9.516 / 3600;
  db.prepare(`
    INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude
  `).run(placeId, longitude, latitude);
};
