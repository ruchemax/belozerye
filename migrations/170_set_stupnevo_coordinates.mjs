export const up = (db) => {
  const placeId = "pustosh-stupnevo-1626-85";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Ступнево'").get(placeId)) {
    throw new Error("The Stupnevo card was not found.");
  }
  const longitude = 38 + 40 / 60 + 25.046 / 3600;
  const latitude = 59 + 20 / 60 + 48.888 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
