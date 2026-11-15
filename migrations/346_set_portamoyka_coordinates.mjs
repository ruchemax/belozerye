export const up = (db) => {
  const placeId = "pustish-portamoyka-1626-73";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error(`Place not found: ${placeId}`);
  }
  const longitude = 38 + 34 / 60 + 17.145 / 3600;
  const latitude = 59 + 21 / 60 + 23.083 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
