export const up = (db) => {
  const placeId = "pustosh-mordvinovo-1626-88";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Мордвиново'").get(placeId)) {
    throw new Error("The Mordvinovo card was not found.");
  }
  const longitude = 38 + 36 / 60 + 46.479 / 3600;
  const latitude = 59 + 22 / 60 + 42.296 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
