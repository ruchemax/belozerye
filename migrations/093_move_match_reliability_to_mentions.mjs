export const up = (db) => {
  db.exec(`
    ALTER TABLE mentions ADD COLUMN match_reliability TEXT NOT NULL DEFAULT 'unreviewed'
      CHECK (match_reliability IN ('exact', 'probable', 'unreviewed'));
    UPDATE mentions
    SET match_reliability = COALESCE(
      (SELECT status FROM mention_place_links WHERE mention_id = mentions.id),
      'unreviewed'
    );
    UPDATE mentions
    SET place_id = (SELECT place_id FROM mention_place_links WHERE mention_id = mentions.id)
    WHERE EXISTS (SELECT 1 FROM mention_place_links WHERE mention_id = mentions.id);
    DROP TABLE mention_place_links;
  `);
};
