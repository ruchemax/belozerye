export const up = (db) => {
  const mentionId = "mention-belozersky-1544-place-12-1-metropolitan";
  const monasteryId = "loshakovo-monastery";
  const oldState = db.prepare("SELECT * FROM place_name_states WHERE source_mention_id = ?").get(mentionId);
  if (!oldState) throw new Error("The 1544 Loshakovo name state was not found.");

  const placeNameId = "attested:loshakovo-monastery:1544";
  db.prepare(`
    INSERT INTO place_names (id, place_id, name, language, name_kind)
    VALUES (?, ?, ?, 'ru', 'attested')
  `).run(placeNameId, monasteryId, "Починок Лошаково");

  db.prepare("DELETE FROM place_name_states WHERE id = ?").run(oldState.id);
  db.prepare("UPDATE mentions SET place_id = ?, historical_name_override = ? WHERE id = ?")
    .run(monasteryId, "монастырский починок Лошаково", mentionId);
  db.prepare(`
    INSERT INTO place_name_states
      (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    oldState.id, monasteryId, placeNameId, oldState.type_code, mentionId,
    oldState.observed_year, oldState.display_period, oldState.assertion_kind, oldState.position
  );
};
