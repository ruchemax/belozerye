export const up = (db) => {
  // 0.00027° of latitude is about 30 m. Church markers are shifted north
  // to avoid overlapping settlement markers on the shared map.
  const update = db.prepare(`
    UPDATE church_geometries
    SET latitude = ?, source = ?
    WHERE church_id = ?
  `);
  update.run(59.341963611111, "смещение на 30 м к северу от Чаромы для отображения на карте", "ilya-prophet-charoma");
  update.run(59.258308989811, "смещение на 30 м к северу от погоста Рождества Богородицы для отображения на карте", "nativity-bogoroditsy-churovskaya");
};
