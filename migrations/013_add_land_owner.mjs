const columns = (db, table) => new Set(
  db.prepare(`PRAGMA table_info("${table}")`).all().map((column) => column.name)
);

export const up = (db) => {
  if (!columns(db, "mention_land_categories").has("owner_name")) {
    db.exec("ALTER TABLE mention_land_categories ADD COLUMN owner_name TEXT");
  }
  db.prepare(`
    UPDATE mention_land_categories
    SET owner_name = ?
    WHERE code = 'monastery' AND (owner_name IS NULL OR trim(owner_name) = '')
  `).run("Кирилло-Белозерский монастырь");
};
