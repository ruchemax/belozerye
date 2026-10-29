export const up = (db) => {
  // The marker is placed about 100 m south of the churchyard to avoid
  // overlapping the settlement and the churchyard's second church.
  db.prepare(`
    INSERT INTO church_geometries (church_id, longitude, latitude, source)
    VALUES (?, ?, ?, ?)
  `).run(
    "nicholas-chudotvorets-churovskaya",
    38.597633427041,
    59.257138989811,
    "смещение на 100 м к югу от погоста Рождества Богородицы для отображения на карте"
  );
};
