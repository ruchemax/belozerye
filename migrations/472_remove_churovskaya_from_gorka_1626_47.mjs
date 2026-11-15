export const up = (db) => {
  const rows = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m JOIN fragments f ON f.id=m.fragment_id
    WHERE m.place_id='pustosh-gorka-1626-47' AND f.book_id='belozersky-1626'`).all();
  if (rows.length !== 1) throw new Error("Expected one 1626/27 mention for this Gorka wasteland.");
  const unitId = "volost:Чуровская";
  const row = rows[0];
  const result = db.prepare(`DELETE FROM mention_administrative_units
    WHERE mention_id=? AND administrative_unit_id=? AND context_key='volost'`).run(row.id, unitId);
  if (result.changes !== 1) throw new Error("Expected one Churovskaya affiliation for Gorka.");
  db.prepare(`DELETE FROM fragment_administrative_units
    WHERE fragment_id=? AND administrative_unit_id=? AND context_key='volost'`).run(row.fragment_id, unitId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting Gorka.");
};
