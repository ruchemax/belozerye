export const up = (db) => {
  db.prepare(`UPDATE mentions SET match_reason = NULL
    WHERE fragment_id IN (SELECT id FROM fragments WHERE book_id = ?)`)
    .run("kirillov-1601");
};
