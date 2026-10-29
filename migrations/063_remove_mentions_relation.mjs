export const up = (db) => {
  db.exec("ALTER TABLE mentions DROP COLUMN relation");
};
