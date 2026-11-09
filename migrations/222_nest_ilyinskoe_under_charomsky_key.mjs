export const up = (db) => {
  db.exec("ALTER TABLE administrative_units ADD COLUMN parent_id TEXT REFERENCES administrative_units(id) CHECK (parent_id IS NULL OR parent_id <> id)");
  const parentId = "subdivision:Чаромский ключ";
  const childId = "subdivision:село Ильинское";
  for (const id of [parentId, childId]) {
    if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ?").get(id)) {
      throw new Error(`The administrative unit ${id} was not found.`);
    }
  }
  db.prepare("UPDATE administrative_units SET parent_id = ? WHERE id = ?").run(parentId, childId);
};
