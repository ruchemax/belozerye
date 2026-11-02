export const up = (db) => {
  const placeId = "loshakova";
  const sourceMentionId = "mention-belozersky-1544-place-12-1-monastery";
  const nameId = "attested:loshakova:pochinok-1544";

  // The newest observed form is the 1626/27 source form, Лошакова.
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed' WHERE id = ?")
    .run("Лошакова", placeId);

  // Restore the 1544 form to the name history on the metropolitan card. Its
  // type is stored separately so the card renders “починок Лошаково”.
  db.prepare(`
    INSERT INTO place_names (id, place_id, name, language, name_kind)
    VALUES (?, ?, 'Лошаково', 'ru', 'attested')
  `).run(nameId, placeId);
  db.prepare(`
    INSERT INTO place_name_states
      (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES ('observed:loshakova-1544-pochinok', ?, ?, 'pochinok', ?, '1544', '1544', 'observed', 1)
  `).run(placeId, nameId, sourceMentionId);
};
