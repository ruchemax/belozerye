const westwardDistanceMeters = 50;
const churches = [
  {
    id: "nikolaya-chudotvortsa-churovskaya",
    source: "смещение на 100 м к югу и 50 м к западу от погоста Рождества Богородицы для отображения на карте"
  },
  {
    id: "georgiya-pobedonostsa-ugol",
    source: "смещение на 100 м к югу и 50 м к западу от Поповской (погоста Богоявления) для отображения на карте"
  }
];

export const up = (db) => {
  const readGeometry = db.prepare("SELECT longitude, latitude FROM church_geometries WHERE church_id = ?");
  const updateGeometry = db.prepare(`
    UPDATE church_geometries
    SET longitude = ?, source = ?
    WHERE church_id = ?
  `);
  for (const church of churches) {
    const geometry = readGeometry.get(church.id);
    if (!geometry) throw new Error(`Не найдена геометрия церкви ${church.id}.`);
    const metersPerLongitudeDegree = 111320 * Math.cos(geometry.latitude * Math.PI / 180);
    updateGeometry.run(geometry.longitude - westwardDistanceMeters / metersPerLongitudeDegree, church.source, church.id);
  }
};
