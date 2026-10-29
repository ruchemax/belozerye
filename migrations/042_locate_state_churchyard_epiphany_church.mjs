export const up = (db) => {
  db.prepare("UPDATE churches SET location_place_id = ? WHERE id = ?")
    .run("popovskaya", "bogoyavlenie-state-churchyard");

  // The marker is placed about 100 m north of Popovskaya, which corresponds
  // to the Epiphany churchyard, to prevent marker overlap.
  db.prepare(`
    INSERT INTO church_geometries (church_id, longitude, latitude, source)
    VALUES (?, ?, ?, ?)
  `).run(
    "bogoyavlenie-state-churchyard",
    38.607918438013,
    59.224385668356,
    "смещение на 100 м к северу от Поповской (погоста Богоявления) для отображения на карте"
  );
};
