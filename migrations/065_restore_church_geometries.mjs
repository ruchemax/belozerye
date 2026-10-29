export const up = (db) => {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO church_geometries (church_id, longitude, latitude, source)
    VALUES (?, ?, ?, ?)
  `);
  const rows = [
    ["bogoyavlenie-ugol", 38.607918438013, 59.224385668356, "смещение на 100 м к северу от Поповской (погоста Богоявления) для отображения на карте"],
    ["georgiya-pobedonostsa-ugol", 38.607918438013, 59.222585668356, "смещение на 100 м к югу от Поповской (погоста Богоявления) для отображения на карте"],
    ["ili-proroka-charoma", 38.619834166667, 59.342593611111, "смещение на 100 м к северу от Чаромы для отображения на карте"],
    ["nikolaya-chudotvortsa-churovskaya", 38.597633427041, 59.257138989811, "смещение на 100 м к югу от погоста Рождества Богородицы для отображения на карте"],
    ["rozhdestva-bogoroditsy-churovskaya", 38.597633427041, 59.258938989811, "смещение на 100 м к северу от погоста Рождества Богородицы для отображения на карте"]
  ];
  for (const row of rows) insert.run(...row);
};
