export const up = (db) => {
  const update = db.prepare(`
    UPDATE mentions SET match_reason = replace(match_reason, ?, ?)
    WHERE id = ? AND place_id = 'olekseeva' AND instr(match_reason, ?) > 0
  `);
  const removed = "установлено в вытной книге 1559 года по";
  for (const id of ["kirillov-1559-mention-006", "kirillov-1559-mention-079"]) {
    if (update.run(removed, "установлено по", id, removed).changes !== 1) {
      throw new Error(`Expected one Olekseeva explanation: ${id}.`);
    }
  }
};
