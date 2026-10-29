export const up = (db) => {
  db.prepare(`
    UPDATE church_geometries
    SET latitude = ?,
        longitude = ?,
        source = ?
    WHERE church_id = ?
  `).run(
    59.222585668356,
    38.607918438013,
    "смещение на 100 м к югу от Поповской (погоста Богоявления) для отображения на карте",
    "georgiya-pobedonostsa-ugol"
  );
};
