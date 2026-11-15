export const up = (db) => {
  const keyId = "subdivision:Чаромский ключ";
  const records = [[49, "Ондронниково"], [50, "Ретино"], [51, "Квасино"], [52, "Якунино"]];
  for (const [number, name] of records) {
    const rows = db.prepare(`SELECT m.id,m.fragment_id,m.source_name FROM mentions m
      JOIN fragments f ON f.id=m.fragment_id WHERE f.book_id='belozersky-1626' AND f.source_heading_id=?`)
      .all(`folios-547-561-place-${number}-heading`);
    if (rows.length !== 1 || !rows[0].source_name.includes(name)) throw new Error(`Unexpected source record for ${name}.`);
    const row = rows[0];
    const result = db.prepare(`DELETE FROM mention_administrative_units
      WHERE mention_id=? AND context_key='subdivision' AND administrative_unit_id=?`).run(row.id, keyId);
    if (result.changes !== 1) throw new Error(`Expected one Charomsky key affiliation for ${name}.`);
    db.prepare(`DELETE FROM fragment_administrative_units
      WHERE fragment_id=? AND context_key='subdivision' AND administrative_unit_id=?`).run(row.fragment_id, keyId);
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting the four wastelands.");
};
