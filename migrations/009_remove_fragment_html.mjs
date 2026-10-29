export const up = (db) => {
  const columns = new Set(db.prepare("PRAGMA table_info(fragments)").all().map((column) => column.name));
  db.exec("UPDATE fragments SET raw_json = json_remove(raw_json, '$.html')");
  if (columns.has("html")) db.exec("ALTER TABLE fragments DROP COLUMN html");
};
