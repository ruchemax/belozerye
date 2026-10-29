export const up = (db) => {
  const churchId = "georgiya-pobedonostsa-ugol";
  db.prepare("UPDATE churches SET location_place_id = ? WHERE id = ?")
    .run("popovskaya", churchId);
  db.prepare(`
    INSERT INTO church_geometries (church_id, longitude, latitude, source)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(church_id) DO UPDATE SET
      longitude = excluded.longitude,
      latitude = excluded.latitude,
      source = excluded.source
  `).run(
    churchId,
    38.607918438013,
    59.224385668356,
    "координаты погоста Богоявления; общая точка с церковью Богоявления"
  );
};
