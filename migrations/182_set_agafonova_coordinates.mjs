export const up = (db) => {
  const placeId = "pustosh-agafonova-1626-83";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Агафонова'").get(placeId)) {
    throw new Error("The Agafonova card was not found.");
  }
  const longitude = 38 + 35 / 60 + 59.17 / 3600;
  const latitude = 59 + 19 / 60 + 23.429 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
