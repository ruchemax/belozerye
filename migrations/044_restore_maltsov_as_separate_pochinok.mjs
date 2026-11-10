export const up = (db) => {
  const placeId = "maltsov";
  const mentionId = "mention-belozersky-1544-place-10-8";
  const stateId = `observed:${mentionId}`;
  const nameId = "attested:maltsov:235";
  if (db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("Карточка Мальцова уже существует.");
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = 'malchino'").get(mentionId)) {
    throw new Error("Упоминание починка Мальцова за 1544 год не связано с карточкой Малчина.");
  }
  if (!db.prepare("SELECT 1 FROM place_name_states WHERE id = ? AND place_id = 'malchino'").get(stateId)) {
    throw new Error("Историческое имя починка Мальцова не найдено.");
  }

  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Мальцов', 'observed', 'pochinok', 'unknown')`).run(placeId, placeId);
  db.prepare("UPDATE place_name_states SET place_id = ? WHERE id = ?").run(placeId, stateId);
  db.prepare("UPDATE mentions SET place_id = ? WHERE id = ?").run(placeId, mentionId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE id = ?").run(placeId, nameId);
};
