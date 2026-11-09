export const up = (db) => {
  const placeId = "pustosh-vereshchigino-vereshchagino-1626-98";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("The Vereshchagino card was not found.");
  }
  const longitude = 38 + 30 / 60 + 39.261 / 3600;
  const latitude = 59 + 15 / 60 + 43.18 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
