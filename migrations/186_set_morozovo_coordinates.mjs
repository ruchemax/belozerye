export const up = (db) => {
  const placeId = "pustosh-morozovo-1626-91";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Морозово'").get(placeId)) {
    throw new Error("The Morozovo card was not found.");
  }
  const longitude = 38 + 37 / 60 + 54.013 / 3600;
  const latitude = 59 + 23 / 60 + 58.791 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
