export const up = (db) => {
  const placeId = "pustosh-feoktistova-1626-99";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Феоктистова'").get(placeId)) {
    throw new Error("The Feoktistova card was not found.");
  }
  const longitude = 38 + 31 / 60 + 18.494 / 3600;
  const latitude = 59 + 15 / 60 + 9.944 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
