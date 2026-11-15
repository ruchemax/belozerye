export const up = (db) => {
  const rows = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m JOIN fragments f ON f.id=m.fragment_id
    WHERE m.place_id='bezsoloe' AND f.book_id='belozersky-1626'`).all();
  if (rows.length !== 1) throw new Error("Expected one 1626/27 mention for Bezsoloe.");
  const unitId = "subdivision:Запогостье";
  for (const row of rows) {
    db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key)
      VALUES (?,?,'subdivision')`).run(row.id, unitId);
    db.prepare(`INSERT OR IGNORE INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key)
      VALUES (?,?,'subdivision')`).run(row.fragment_id, unitId);
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after assigning Zapogostye to Bezsoloe.");
};
