export const up = (db) => {
  const placeId = "poteryaevo";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Потеряево'").get(placeId)) {
    throw new Error("The Poteryaevo card was not found.");
  }
  const longitude = 38 + 25 / 60 + 12.951 / 3600;
  const latitude = 59 + 8 / 60 + 17.277 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
