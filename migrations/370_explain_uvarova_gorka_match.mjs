export const up = (db) => {
  const result = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE id = 'mention-belozersky-1544-place-5-11'
      AND place_id = 'derevnya-gorka-na-rechke-na-ulomke-1626-4'
  `).run("Сопоставление с Горкой предположительное, на основании схожести названия и окружающих поселений.");
  if (result.changes !== 1) throw new Error("Expected one Uvarova Gorka mention from 1544.");
};
