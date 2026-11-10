export const up = (db) => {
  const placeId = "derevnya-1626-6";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("Карточка Малой Игайи не найдена.");
  }
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude)
    VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, 38.59451361111111, 59.33385916666667);
};
