export const up = (db) => {
  const placeId = "pustosh-kvasino-1626-51";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Квасино'").get(placeId)) {
    throw new Error("The Kvasino card was not found.");
  }
  const longitude = 38 + 31 / 60 + 27.322 / 3600;
  const latitude = 59 + 19 / 60 + 20.618 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
