export const up = (db) => {
  const fragmentId = db.prepare(`SELECT id FROM fragments WHERE book_id='belozersky-1626'
    AND source_heading_id='folios-547-561-place-104-heading'`).get()?.id;
  const mention = db.prepare("SELECT id FROM mentions WHERE fragment_id=? AND place_id='zaopoche'").get(fragmentId);
  if (!mention) throw new Error("The 1626/27 Pochka mention was not found.");
  if (!db.prepare(`SELECT 1 FROM mention_administrative_units
    WHERE mention_id=? AND context_key='selo' AND administrative_unit_id='subdivision:село Ильинское'`).get(mention.id)) {
    throw new Error("The Ilyinskoe affiliation is missing for Pochka.");
  }
  const result = db.prepare(`DELETE FROM mention_administrative_units
    WHERE mention_id=? AND context_key='volost' AND administrative_unit_id='volost:Чуровская'`).run(mention.id);
  if (result.changes !== 1) throw new Error("Expected one erroneous Churovskaya affiliation for Pochka.");
  db.prepare(`DELETE FROM fragment_administrative_units
    WHERE fragment_id=? AND context_key='volost' AND administrative_unit_id='volost:Чуровская'`).run(fragmentId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting Pochka.");
};
