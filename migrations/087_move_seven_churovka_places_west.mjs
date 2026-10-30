const westwardDistanceMeters = 120;
const placeIds = [
  "bezsoloe",
  "golodyaevo",
  "lyshkovo",
  "okoemovo",
  "oksenovo",
  "rublevo",
  "sintsovskoe"
];

export const up = (db) => {
  const readGeometry = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?");
  const updateGeometry = db.prepare("UPDATE place_geometries SET longitude = ? WHERE place_id = ?");

  for (const placeId of placeIds) {
    const geometry = readGeometry.get(placeId);
    if (!geometry) throw new Error(`Не найдена геометрия населённого пункта ${placeId}.`);
    const metersPerLongitudeDegree = 111320 * Math.cos(geometry.latitude * Math.PI / 180);
    updateGeometry.run(geometry.longitude - westwardDistanceMeters / metersPerLongitudeDegree, placeId);
  }
};
