export const up = (db) => {
  db.exec(`
    DROP INDEX IF EXISTS place_names_source_mention_idx;
    ALTER TABLE place_names DROP COLUMN source_mention_id;
  `);
};
