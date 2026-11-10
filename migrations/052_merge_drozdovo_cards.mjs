export const up = (db) => {
  const targetId = "drozdovo";
  const sourceId = "drozdovo-churovka";
  const oldMentionId = "mention-belozersky-1544-place-9-26";
  const recentMentionId = "belozersky-1626-mention-folios-547-561-place-14";
  const oldStateId = `observed:${oldMentionId}`;
  const recentStateId = `observed:${recentMentionId}:0`;
  const nameId = "editorial:drozdovo:252";
  const duplicateNameId = "attested:drozdovo-churovka:1626";

  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)
    || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(sourceId)) {
    throw new Error("Одна из двух карточек Дроздово не найдена.");
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(oldMentionId, targetId)
    || !db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(recentMentionId, sourceId)) {
    throw new Error("Упоминания Дроздово не соответствуют ожидаемым карточкам.");
  }
  const geometry = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(sourceId);
  if (!geometry) throw new Error("Координаты Дроздово за 1626/27 год не найдены.");

  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`UPDATE place_name_states SET place_id = ?, place_name_id = ? WHERE id = ?`)
    .run(targetId, nameId, oldStateId);
  db.prepare("UPDATE place_name_states SET place_id = ?, place_name_id = ?, position = 0 WHERE id = ?")
    .run(targetId, nameId, recentStateId);
  db.prepare("UPDATE place_name_states SET position = 1 WHERE id = ?").run(oldStateId);
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?")
    .run(targetId, oldMentionId);
  db.prepare("UPDATE mentions SET place_id = ? WHERE id = ?").run(targetId, recentMentionId);
  db.prepare("DELETE FROM place_names WHERE id = ?").run(duplicateNameId);
  db.prepare("UPDATE place_geometries SET place_id = ? WHERE place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE places SET name = 'Дроздово', name_origin = 'observed', type_code = 'village' WHERE id = ?")
    .run(targetId);
  db.prepare("DELETE FROM places WHERE id = ?").run(sourceId);
};
