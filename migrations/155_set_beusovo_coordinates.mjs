export const up = (db) => {
  const placeId = "pustosh-beusovo-1626-65";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Беусово'").get(placeId)) {
    throw new Error("The Beusovo card was not found.");
  }
  const longitude = 38 + 40 / 60 + 59.862 / 3600;
  const latitude = 59 + 20 / 60 + 28.888 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
