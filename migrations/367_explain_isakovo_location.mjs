export const up = (db) => {
  const result = db.prepare("UPDATE place_geometries SET location_note = ? WHERE place_id = ?")
    .run(
      "Местоположение определено предположительно по положению ручья Исаковского на ПГМ Череповского уезда 1788 года.",
      "isakovo"
    );
  if (result.changes !== 1) throw new Error("Expected coordinates for Isakovo.");
};
