export const up = (db) => {
  db.exec("ALTER TABLE churches DROP COLUMN map_label");
};
