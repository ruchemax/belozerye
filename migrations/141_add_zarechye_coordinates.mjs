export const up = (db) => {
  const placeId = "larino";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Заречье'").get(placeId)) throw new Error("The Zarechye card was not found.");
  const longitude = 38 + 23 / 60 + 52.829 / 3600;
  const latitude = 59 + 8 / 60 + 3.262 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
