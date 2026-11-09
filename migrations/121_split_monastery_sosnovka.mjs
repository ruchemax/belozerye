export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-17";
  const placeId = "sosnovka-monastery";
  const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
  if (mention?.place_id !== "sosnovka") throw new Error("The monastery Sosnovka mention was not found on the original card.");
  const states = db.prepare("SELECT * FROM place_name_states WHERE source_mention_id = ? ORDER BY position").all(mentionId);
  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Сосновка', 'observed', 'village', 'unknown')`).run(placeId, placeId);

  const nameId = "attested:sosnovka-monastery:1626";
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, 'Сосновка', 'ru', 'attested')")
    .run(nameId, placeId);
  db.prepare("DELETE FROM place_name_states WHERE source_mention_id = ?").run(mentionId);
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?").run(placeId, mentionId);
  const insertState = db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const [position, state] of states.entries()) {
    insertState.run(state.id, placeId, nameId, state.type_code, mentionId,
      state.observed_year, state.display_period, state.assertion_kind, position);
  }
};
