export const up = (db) => {
  const placeId = "pustosh-bollshoy-bolshoy-dvor-na-rechke-na-pizdavke-1626-39";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("The Bolshoy Dvor card was not found.");
  }
  const longitude = 38 + 30 / 60 + 13.06 / 3600;
  const latitude = 59 + 27 / 60 + 38.666 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
