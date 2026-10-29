export const up = (db) => {
  const columns = new Set(db.prepare("PRAGMA table_info(mentions)").all().map((column) => column.name));
  if (columns.has("settlement_state")) db.exec("ALTER TABLE mentions DROP COLUMN settlement_state");
};
