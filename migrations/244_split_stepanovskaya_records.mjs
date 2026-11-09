export const up = (db) => {
  const originalId = "pustosh-stepanovskaya-1626-71";
  const placeId = "pustosh-stepanovskaya-1626-93";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-93";
  const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
  const states = db.prepare("SELECT id FROM place_name_states WHERE source_mention_id = ?").all(mentionId);
  if (mention?.place_id !== originalId || states.length !== 1) {
    throw new Error("The second Stepanovskaya record was not found on the combined card.");
  }
  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Степановская', 'observed', 'pustosh', 'unknown')`).run(placeId, placeId);
  const nameId = "attested:belozersky-1626-mention-folios-547-561-place-93:0";
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, 'Степановская', 'ru', 'attested')")
    .run(nameId, placeId);
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?").run(placeId, mentionId);
  db.prepare("UPDATE place_name_states SET place_id = ?, place_name_id = ?, position = 0 WHERE source_mention_id = ?")
    .run(placeId, nameId, mentionId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after splitting Stepanovskaya.");
};
