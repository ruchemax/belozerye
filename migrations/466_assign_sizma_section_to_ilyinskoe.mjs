export const up = (db) => {
  const seloId = "subdivision:село Ильинское";
  const bookId = "belozersky-1626";
  const section = "folios-547-561-%";
  const changed = db.prepare(`UPDATE administrative_units
    SET kind='selo',name='Ильинское',label='Село Ильинское',parent_id=NULL WHERE id=?`).run(seloId);
  if (changed.changes !== 1) throw new Error("The Ilyinskoe unit was not found.");
  // Household dependence on the village is independent of the territorial subdivisions.
  db.prepare("DELETE FROM mention_administrative_units WHERE administrative_unit_id=?").run(seloId);
  db.prepare("DELETE FROM fragment_administrative_units WHERE administrative_unit_id=?").run(seloId);
  const mentions = db.prepare(`INSERT INTO mention_administrative_units
    (mention_id,administrative_unit_id,context_key)
    SELECT m.id,?,'selo' FROM mentions m JOIN fragments f ON f.id=m.fragment_id
    WHERE f.book_id=? AND f.source_heading_id LIKE ?`).run(seloId, bookId, section);
  if (mentions.changes !== 105) throw new Error(`Expected 105 mentions, found ${mentions.changes}.`);
  db.prepare(`INSERT INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key)
    SELECT id,?,'selo' FROM fragments WHERE book_id=? AND source_heading_id LIKE ?`)
    .run(seloId, bookId, section);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after assigning Ilyinskoe.");
};
