const columns = (db, table) => new Set(
  db.prepare(`PRAGMA table_info("${table}")`).all().map((column) => column.name)
);

export const up = (db) => {
  if (columns(db, "places").has("raw_json")) db.exec("ALTER TABLE places DROP COLUMN raw_json");
  if (columns(db, "mentions").has("raw_json")) db.exec("ALTER TABLE mentions DROP COLUMN raw_json");
};
