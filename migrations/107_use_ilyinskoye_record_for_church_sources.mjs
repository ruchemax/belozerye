export const up = (db) => {
  const oldFragment = "belozersky-1626-fragment-folios-547-561-place-1-church-source";
  const recordFragment = "belozersky-1626-fragment-folios-547-561-place-1";
  if (!db.prepare("SELECT 1 FROM fragments WHERE id = ?").get(recordFragment)) {
    throw new Error("The Ilyinskoye record fragment was not found.");
  }
  const sources = db.prepare("SELECT church_id FROM church_sources WHERE fragment_id = ?").all(oldFragment);
  for (const { church_id: churchId } of sources) {
    db.prepare("INSERT OR IGNORE INTO church_sources (church_id, fragment_id) VALUES (?, ?)")
      .run(churchId, recordFragment);
  }
  db.prepare("DELETE FROM church_sources WHERE fragment_id = ?").run(oldFragment);
  db.prepare("DELETE FROM fragments WHERE id = ? AND NOT EXISTS (SELECT 1 FROM mentions WHERE fragment_id = ?)")
    .run(oldFragment, oldFragment);
};
