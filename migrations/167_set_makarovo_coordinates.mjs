export const up = (db) => {
  const placeId = "pustosh-makarovo-1626-77";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Макарово'").get(placeId)) {
    throw new Error("The 1626/27 Makarovo card was not found.");
  }
  const longitude = 38 + 40 / 60 + 16.831 / 3600;
  const latitude = 59 + 21 / 60 + 31.29 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
