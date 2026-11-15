const places = ["selishche", "larino", "poteryaevo", "kharlamovo", "zaopoche"];

export const up = (db) => {
  const sudbitsyId = "subdivision:Судбицах";
  const keyId = "subdivision:Чаромский ключ";
  let removed = 0;
  for (const placeId of places) {
    const rows = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m JOIN fragments f ON f.id=m.fragment_id
      WHERE m.place_id=? AND f.book_id='belozersky-1626' AND f.source_heading_id LIKE 'folios-547-561-%'`).all(placeId);
    if (rows.length !== 1) throw new Error(`Expected one 1626/27 mention for ${placeId}.`);
    for (const row of rows) {
      if (!db.prepare(`SELECT 1 FROM mention_administrative_units
        WHERE mention_id=? AND context_key='selo' AND administrative_unit_id='subdivision:село Ильинское'`).get(row.id)) {
        throw new Error(`Missing Ilyinskoe affiliation for ${placeId}.`);
      }
      removed += db.prepare(`DELETE FROM mention_administrative_units
        WHERE mention_id=? AND context_key='subdivision' AND administrative_unit_id=?`).run(row.id, keyId).changes;
      db.prepare(`DELETE FROM fragment_administrative_units
        WHERE fragment_id=? AND context_key='subdivision' AND administrative_unit_id=?`).run(row.fragment_id, keyId);
      db.prepare(`INSERT OR IGNORE INTO mention_administrative_units (mention_id,administrative_unit_id,context_key)
        VALUES (?,?,'subdivision')`).run(row.id, sudbitsyId);
      db.prepare(`INSERT OR IGNORE INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key)
        VALUES (?,?,'subdivision')`).run(row.fragment_id, sudbitsyId);
    }
  }
  if (removed !== 3) throw new Error(`Expected three erroneous Charomsky key affiliations, found ${removed}.`);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after assigning Sudbitsy.");
};
