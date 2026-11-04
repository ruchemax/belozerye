export const up = (db) => {
  const result = db.prepare(`
    UPDATE place_geometries
    SET longitude = ?, latitude = ?
    WHERE place_id = ?
  `).run(38.629290555556, 59.230541666667, "isakovo");

  if (result.changes !== 1) {
    throw new Error(`Expected one geometry for isakovo, updated ${result.changes}.`);
  }
};
