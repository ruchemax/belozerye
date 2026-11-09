export const up = (db) => {
  const placeId = "pustosh-lodygino-1626-80";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Лодыгино'").get(placeId)) {
    throw new Error("The Lodygino card was not found.");
  }
  const longitude = 38 + 44 / 60 + 28.965 / 3600;
  const latitude = 59 + 19 / 60 + 5.253 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
