export const up = (db) => {
  const bookId = "belozersky-1626";
  const volostId = "volost:Чуровская";
  const seloId = "subdivision:село Ильинское";
  let removed = 0;
  for (const placeId of ["poteryaevo", "kharlamovo", "larino"]) {
    const mentions = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m
      JOIN fragments f ON f.id=m.fragment_id
      WHERE m.place_id=? AND f.book_id=? AND f.source_heading_id LIKE 'folios-547-561-%'`)
      .all(placeId, bookId);
    if (mentions.length !== 1) throw new Error(`Expected one section mention for ${placeId}.`);
    for (const mention of mentions) {
      if (!db.prepare(`SELECT 1 FROM mention_administrative_units
        WHERE mention_id=? AND administrative_unit_id=? AND context_key='selo'`).get(mention.id, seloId)) {
        throw new Error(`The Ilyinskoe affiliation is missing for ${placeId}.`);
      }
      removed += db.prepare(`DELETE FROM mention_administrative_units
        WHERE mention_id=? AND administrative_unit_id=? AND context_key='volost'`).run(mention.id, volostId).changes;
      db.prepare(`DELETE FROM fragment_administrative_units
        WHERE fragment_id=? AND administrative_unit_id=? AND context_key='volost'`).run(mention.fragment_id, volostId);
    }
  }
  // Zarechye already has no Churovskaya affiliation in this book.
  if (removed !== 2) throw new Error(`Expected two erroneous volost links, found ${removed}.`);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting the volost affiliations.");
};
