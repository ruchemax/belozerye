export const up = (db) => {
  const placeId = "sosnovka-monastery";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("The Sosnovka monastery card was not found.");
  }
  const longitude = 38 + 33 / 60 + 33.806 / 3600;
  const latitude = 59 + 18 / 60 + 43.053 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
