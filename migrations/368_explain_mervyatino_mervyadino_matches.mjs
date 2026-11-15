export const up = (db) => {
  const reason = "Сопоставление с Мордвиновом предположительное, на основании схожести названия и окружающих поселений.";
  const update = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE id = ? AND place_id = 'pustosh-mordvinovo-1626-88'
  `);
  for (const id of [
    "mention-belozersky-1544-place-5-4",
    "kirillov-1559-mention-001",
    "kirillov-1559-mention-084"
  ]) {
    if (update.run(reason, id).changes !== 1) throw new Error(`Expected one Mordvinovo source mention: ${id}.`);
  }
};
