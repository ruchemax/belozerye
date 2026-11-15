export const up = (db) => {
  const keyId = "subdivision:Чаромский ключ";
  let removed = 0;
  for (let number = 57; number <= 106; number++) {
    const rows = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m JOIN fragments f ON f.id=m.fragment_id
      WHERE f.book_id='belozersky-1626' AND f.source_heading_id=?`)
      .all(`folios-547-561-place-${number}-heading`);
    if (rows.length !== 1) throw new Error(`Expected one old wasteland record at position ${number}.`);
    const row = rows[0];
    if (!db.prepare(`SELECT 1 FROM mention_administrative_units WHERE mention_id=?
      AND context_key='selo' AND administrative_unit_id='subdivision:село Ильинское'`).get(row.id)) {
      throw new Error(`Missing Ilyinskoe affiliation at position ${number}.`);
    }
    removed += db.prepare(`DELETE FROM mention_administrative_units
      WHERE mention_id=? AND context_key='subdivision' AND administrative_unit_id=?`).run(row.id, keyId).changes;
    db.prepare(`DELETE FROM fragment_administrative_units
      WHERE fragment_id=? AND context_key='subdivision' AND administrative_unit_id=?`).run(row.fragment_id, keyId);
  }
  // Three entries were already corrected and assigned to Sudbitsy.
  if (removed !== 47) throw new Error(`Expected 47 remaining Charomsky key links, found ${removed}.`);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting old wasteland affiliations.");
};
