export const up = (db) => {
  const rows = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m JOIN fragments f ON f.id=m.fragment_id
    WHERE m.place_id='kurakin' AND f.book_id='belozersky-1626'`).all();
  if (rows.length !== 1) throw new Error("Expected one 1626/27 mention for Kurakin.");
  const row = rows[0];
  const removed = db.prepare(`DELETE FROM mention_administrative_units
    WHERE mention_id=? AND administrative_unit_id='volost:Чуровская' AND context_key='volost'`).run(row.id);
  if (removed.changes !== 1) throw new Error("Expected one Churovskaya affiliation for Kurakin.");
  db.prepare(`DELETE FROM fragment_administrative_units
    WHERE fragment_id=? AND administrative_unit_id='volost:Чуровская' AND context_key='volost'`).run(row.fragment_id);
  db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key)
    VALUES (?,'subdivision:Коленца','subdivision')`).run(row.id);
  db.prepare(`INSERT OR IGNORE INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key)
    VALUES (?,'subdivision:Коленца','subdivision')`).run(row.fragment_id);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting Kurakin.");
};
