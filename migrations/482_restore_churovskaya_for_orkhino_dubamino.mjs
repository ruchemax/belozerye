export const up = (db) => {
  for (const [number, name] of [[78, "Орхино"], [79, "Дубамино"]]) {
    const rows = db.prepare(`SELECT m.id,m.source_name FROM mentions m JOIN fragments f ON f.id=m.fragment_id
      WHERE f.book_id='belozersky-1626' AND f.source_heading_id=?`).all(`folios-547-561-place-${number}-heading`);
    if (rows.length !== 1 || !rows[0].source_name.includes(name)) throw new Error(`Unexpected 1626/27 record for ${name}.`);
    db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key)
      VALUES (?,'volost:Чуровская','volost')`).run(rows[0].id);
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after restoring the volost affiliations.");
};
