export const up = (db) => {
  const placeId = "pustosh-stepanovskaya-1626-71";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Степановская'").get(placeId)) {
    throw new Error("The Stepanovskaya card was not found.");
  }
  const longitude = 38 + 38 / 60 + 53.822 / 3600;
  const latitude = 59 + 23 / 60 + 24.502 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
