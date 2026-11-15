export const up = (db) => {
  const oldId = "subdivision:Коленца";
  const newId = "subdivision:Коленца-1559";
  const parentId = "subdivision:Кощиевский ключ";
  const bookId = "kirillov-1559";
  // The same locality appears in other books with different historical contexts.
  db.prepare(`INSERT INTO administrative_units (id,kind,name,label,parent_id)
    SELECT ?,kind,'Коленец Кощиевского ключа',name,? FROM administrative_units WHERE id=?`)
    .run(newId, parentId, oldId);
  const result = db.prepare(`UPDATE mention_administrative_units SET administrative_unit_id=?
    WHERE administrative_unit_id=? AND mention_id IN (
      SELECT m.id FROM mentions m JOIN fragments f ON f.id=m.fragment_id WHERE f.book_id=?
    )`).run(newId, oldId, bookId);
  if (result.changes !== 18) throw new Error(`Expected 18 Kolenets mentions, found ${result.changes}.`);
  db.prepare(`UPDATE fragment_administrative_units SET administrative_unit_id=?
    WHERE administrative_unit_id=? AND fragment_id IN (SELECT id FROM fragments WHERE book_id=?)`)
    .run(newId, oldId, bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after nesting Kolenets.");
};
