export const up = (db) => {
  const result = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE id = 'mention-belozersky-1544-place-5-8' AND place_id = 'romanovskoe'
  `).run("Сопоставление с Дупелневом предположительное, на основании схожести названия и окружающих поселений.");
  if (result.changes !== 1) throw new Error("Expected one Ramene Dupelnoe mention from 1544.");
};
