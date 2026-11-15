export const up = (db) => {
  const parent = db.prepare("SELECT id FROM administrative_units WHERE kind='subdivision' AND name='Сизма'").get();
  const child = db.prepare("SELECT id FROM administrative_units WHERE kind='subdivision' AND name='Чяромские'").get();
  if (!parent || !child) throw new Error("The Sizma and Charomskie administrative units were not found.");
  db.prepare("UPDATE administrative_units SET parent_id=? WHERE id=?").run(parent.id, child.id);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid administrative references.");
};
