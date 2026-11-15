export const up = (db) => {
  const result = db.prepare(`
    UPDATE mentions SET match_reliability = 'unreviewed'
    WHERE match_reliability = 'probable'
      AND (match_reason IS NULL OR trim(match_reason) = '')
  `).run();
  console.log(`Marked ${result.changes} unexplained source matches as unreviewed.`);
};
