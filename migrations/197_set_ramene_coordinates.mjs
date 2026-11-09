export const up = (db) => {
  const placeId = "ramene";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Раменье'").get(placeId)) {
    throw new Error("The Ramene card was not found.");
  }
  const longitude = 38 + 29 / 60 + 27.104 / 3600;
  const latitude = 59 + 28 / 60 + 56.21 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
