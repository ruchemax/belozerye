export const up = (db) => {
  const churchId = "rozhdestva-khristova-zapogost";
  const placeId = "zapogostye";
  const point = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(placeId);
  if (!point) throw new Error("The Zapogostye pogost coordinates were not found.");
  if (!db.prepare("SELECT 1 FROM churches WHERE id = ?").get(churchId)) throw new Error("The Nativity of Christ church card was not found.");
  db.prepare("UPDATE churches SET location_place_id = ? WHERE id = ?").run(placeId, churchId);
  db.prepare(`
    INSERT INTO church_geometries (church_id, longitude, latitude, source)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(church_id) DO UPDATE SET
      longitude = excluded.longitude, latitude = excluded.latitude, source = excluded.source
  `).run(churchId, point.longitude, point.latitude, "координаты погоста Запогостье по указанию пользователя");
};
