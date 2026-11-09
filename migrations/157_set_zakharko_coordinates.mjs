export const up = (db) => {
  const placeId = "pustosh-zakharko-1626-57";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Захарко'").get(placeId)) {
    throw new Error("The Zakharko card was not found.");
  }
  const longitude = 38 + 40 / 60 + 59.862 / 3600;
  const latitude = 59 + 20 / 60 + 28.888 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
