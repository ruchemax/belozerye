export const up = (db) => {
  const oldPlaceId = "oleksino";
  const newPlaceId = "olekseeva";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-7";
  const stateId = `observed:${mentionId}:0`;
  const nameId = `attested:${mentionId}:0`;
  const place = db.prepare("SELECT name FROM places WHERE id = ?").get(oldPlaceId);
  if (!place || place.name !== "Олексеева") {
    throw new Error("Объединённая карточка Олексино/Олексеева не найдена.");
  }
  if (db.prepare("SELECT 1 FROM places WHERE id = ? OR slug = ?").get(newPlaceId, newPlaceId)) {
    throw new Error("Карточка Олексеева уже существует.");
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, oldPlaceId)
    || !db.prepare("SELECT 1 FROM place_name_states WHERE id = ? AND place_id = ?").get(stateId, oldPlaceId)
    || !db.prepare("SELECT 1 FROM place_names WHERE id = ? AND place_id = ?").get(nameId, oldPlaceId)) {
    throw new Error("Данные упоминания Олексеева не найдены.");
  }

  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Олексеева', 'observed', 'village', 'unknown')`).run(newPlaceId, newPlaceId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = 0 WHERE id = ?")
    .run(newPlaceId, stateId);
  db.prepare("UPDATE mentions SET place_id = ? WHERE id = ?").run(newPlaceId, mentionId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE id = ?").run(newPlaceId, nameId);
  db.prepare("UPDATE places SET name = 'Олексино', name_origin = 'observed' WHERE id = ?")
    .run(oldPlaceId);
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude)
    VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(newPlaceId, 38.610264047512, 59.343476119048);
};
