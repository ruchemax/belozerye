export const up = (db) => {
  // 0.0009° of latitude is about 100 m. The offset is used only to separate map markers.
  const update = db.prepare(`
    UPDATE church_geometries
    SET latitude = ?, source = ?
    WHERE church_id = ?
  `);
  update.run(59.342593611111, "смещение на 100 м к северу от Чаромы для отображения на карте", "ilya-prophet-charoma");
  update.run(59.258938989811, "смещение на 100 м к северу от погоста Рождества Богородицы для отображения на карте", "nativity-bogoroditsy-churovskaya");
};
