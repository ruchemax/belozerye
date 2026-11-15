export const up = (db) => {
  const originalId = "pustosh-mikitino-1626-100";
  const placeId = "nikitino-1559";
  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Никитино', 'observed', 'village', 'unknown')`).run(placeId, placeId);
  for (const [position, suffix] of ["040", "076"].entries()) {
    const mentionId = `kirillov-1559-mention-${suffix}`;
    const fragmentId = `kirillov-1559-fragment-${suffix}`;
    const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
    if (mention?.place_id !== originalId) throw new Error(`Unexpected settlement for ${mentionId}.`);
    for (const state of db.prepare("SELECT id, place_name_id FROM place_name_states WHERE source_mention_id = ?").all(mentionId)) {
      db.prepare("UPDATE place_names SET place_id = ? WHERE id = ?").run(placeId, state.place_name_id);
      db.prepare("UPDATE place_name_states SET place_id = ?, position = ? WHERE id = ?").run(placeId, position, state.id);
    }
    db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?").run(placeId, mentionId);
    const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
    const raw = JSON.parse(fragment.raw_json);
    delete raw.source_group_label;
    db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?").run(JSON.stringify(raw), fragmentId);
  }
  const book = db.prepare("SELECT html FROM book_documents WHERE book_id = 'kirillov-1559'").get();
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = 'kirillov-1559'")
    .run(book.html.replaceAll(`/places/${originalId}/`, `/places/${placeId}/`));
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after separating Nikitino from Mikitino.");
};
