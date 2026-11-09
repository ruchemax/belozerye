export const up = (db) => {
  const placeId = "pustosh-mikitino-1626-100";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Микитино'").get(placeId)) {
    throw new Error("The Mikitino card was not found.");
  }
  const longitude = 38 + 31 / 60 + 26.032 / 3600;
  const latitude = 59 + 15 / 60 + 26.562 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
