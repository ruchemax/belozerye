export const up = (db) => {
  const result = db.prepare(`
    UPDATE mentions
    SET source_name = ?
    WHERE id = ? AND place_id = ?
  `).run("Деревня Окоемово", "belozersky-1626-mention-folios-547-561-place-36", "okoemovo");
  if (result.changes !== 1) throw new Error("The Okoemovo source mention was not found.");
};
