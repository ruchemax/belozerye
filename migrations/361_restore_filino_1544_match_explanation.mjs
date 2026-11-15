export const up = (db) => {
  const result = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE id = 'mention-belozersky-1544-place-1-12' AND place_id = 'olekseeva'
  `).run("Соответствие между Филино и Елисеево установлено в вытной книге 1559 года по полному соответствию жителей.");
  if (result.changes !== 1) throw new Error("Expected one Filino mention from 1544.");
};
