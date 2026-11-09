export const up = (db) => {
  const placeId = "pustosh-kuchino-1626-96";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Кучино'").get(placeId)) {
    throw new Error("The Kuchino card was not found.");
  }
  const longitude = 38 + 31 / 60 + 27.533 / 3600;
  const latitude = 59 + 18 / 60 + 57.557 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
