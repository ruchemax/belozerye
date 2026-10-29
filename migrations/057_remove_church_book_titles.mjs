export const up = (db) => {
  db.exec("ALTER TABLE churches DROP COLUMN book_title");
  db.exec("ALTER TABLE church_sources DROP COLUMN book_title");
};
