export const up = (db) => {
  const placeId = "olekseeva";
  const stateId = "observed:mention-belozersky-1544-place-1-12";
  const nameId = "attested:olekseeva:filino-1544";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("Карточка Олексеева не найдена.");
  }
  if (!db.prepare("SELECT 1 FROM place_name_states WHERE id = ? AND place_id = ?").get(stateId, placeId)) {
    throw new Error("Упоминание Филина за 1544 год не найдено в карточке Олексеева.");
  }
  db.prepare(`INSERT INTO place_names (id, place_id, name, language, name_kind)
    VALUES (?, ?, 'Филино', 'ru', 'attested')`).run(nameId, placeId);
  db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE id = ? AND place_id = ?")
    .run(nameId, stateId, placeId);
};
