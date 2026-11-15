export const up = (db) => {
  const result = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE id = 'mention-belozersky-1544-place-7-7' AND place_id = 'voroshnino'
  `).run("Соответствие с Верещагино определено предположительно на основании схожести названия и окружающих населённых пунктов в тексте.");
  if (result.changes !== 1) throw new Error("Expected one Voroshnino mention from 1544.");
};
