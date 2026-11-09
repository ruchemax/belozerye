export const up = (db) => {
  const placeId = "pustosh-ignashkovo-1626-81";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Игнашково'").get(placeId)) {
    throw new Error("The Ignashkovo card was not found.");
  }
  const longitude = 38 + 43 / 60 + 48.918 / 3600;
  const latitude = 59 + 18 / 60 + 16.712 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
