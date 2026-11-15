export const up = (db) => {
  const reason = "Соответствие с Сосновкой определено предположительно на основании схожести названия и окружающих населённых пунктов в тексте.";
  const update = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE id = ? AND place_id = 'sosnovka-monastery'
  `);
  for (const id of ["kirillov-1559-mention-044", "kirillov-1559-mention-113"]) {
    if (update.run(reason, id).changes !== 1) {
      throw new Error(`Expected one Sosnovets mention: ${id}.`);
    }
  }
};
