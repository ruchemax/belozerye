export const up = (db) => {
  db.prepare("UPDATE churches SET location_place_id = ? WHERE id = ?")
    .run("popovskaya", "bogoyavlenie-ugol");
  db.prepare(`
    INSERT INTO church_geometries (church_id, longitude, latitude, source)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(church_id) DO UPDATE SET
      longitude = excluded.longitude,
      latitude = excluded.latitude,
      source = excluded.source
  `).run(
    "bogoyavlenie-ugol",
    38.607918438013,
    59.224385668356,
    "смещение на 100 м к северу от Поповской (погоста Богоявления) для отображения на карте"
  );
};
