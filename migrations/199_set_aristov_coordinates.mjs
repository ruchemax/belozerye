export const up = (db) => {
  const placeId = "aristov";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Аристов'").get(placeId)) {
    throw new Error("The Aristov card was not found.");
  }
  const longitude = 38 + 29 / 60 + 49.932 / 3600;
  const latitude = 59 + 29 / 60 + 15.728 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
