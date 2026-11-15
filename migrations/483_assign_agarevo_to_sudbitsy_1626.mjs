export const up = (db) => {
  const rows = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m JOIN fragments f ON f.id=m.fragment_id
    WHERE m.place_id='pustosh-agarevo-1626-101' AND f.book_id='belozersky-1626'`).all();
  if (rows.length !== 1) throw new Error("Expected one 1626/27 mention for Agarevo.");
  const row = rows[0];
  const result = db.prepare(`DELETE FROM mention_administrative_units
    WHERE mention_id=? AND context_key='volost' AND administrative_unit_id='volost:Чуровская'`).run(row.id);
  if (result.changes !== 1) throw new Error("Expected one Churovskaya affiliation for Agarevo.");
  db.prepare(`DELETE FROM fragment_administrative_units
    WHERE fragment_id=? AND context_key='volost' AND administrative_unit_id='volost:Чуровская'`).run(row.fragment_id);
  db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key)
    VALUES (?,'subdivision:Судбицах','subdivision')`).run(row.id);
  db.prepare(`INSERT OR IGNORE INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key)
    VALUES (?,'subdivision:Судбицах','subdivision')`).run(row.fragment_id);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting Agarevo.");
};
