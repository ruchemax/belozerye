export const up = (db) => {
  const placeId = "pustosh-rzhavitsy-1626-74";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Ржавицы'").get(placeId)) {
    throw new Error("The Rzhavitsy card was not found.");
  }
  const longitude = 38 + 33 / 60 + 46.143 / 3600;
  const latitude = 59 + 20 / 60 + 19.562 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
