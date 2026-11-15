export const up = (db) => {
  db.prepare(`UPDATE mentions SET match_reason = NULL
    WHERE fragment_id IN (
      SELECT id FROM fragments WHERE book_id = 'kirillov-1559'
      AND (id LIKE 'kirillov-1559-seed-koshchievsky-%'
        OR id LIKE 'kirillov-1559-rent-koshchievsky-%')
    )`).run();
};
