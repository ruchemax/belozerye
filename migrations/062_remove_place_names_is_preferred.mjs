export const up = (db) => {
  db.exec("ALTER TABLE place_names DROP COLUMN is_preferred");
};
