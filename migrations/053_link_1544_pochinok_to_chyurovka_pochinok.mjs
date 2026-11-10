export const up = (db) => {
  const sourcePlaceId = "pochinok-ugla";
  const targetPlaceId = "derevnya-pochinok-na-rechke-na-chyurovke-1626-34";
  const mentionId = "mention-belozersky-1544-place-9-25";
  const stateId = `observed:${mentionId}`;
  const targetNameId = "attested:split-pochinok:34:0";

  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(sourcePlaceId)
    || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetPlaceId)) {
    throw new Error("Исходная или целевая карточка Починка не найдена.");
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, sourcePlaceId)) {
    throw new Error("Упоминание «Деревня Починок» за 1544 год не найдено на ожидаемой карточке.");
  }
  if (!db.prepare("SELECT 1 FROM place_name_states WHERE id = ? AND place_id = ?").get(stateId, sourcePlaceId)) {
    throw new Error("Именное состояние Починка за 1544 год не найдено.");
  }
  if (!db.prepare("SELECT 1 FROM place_names WHERE id = ? AND place_id = ?").get(targetNameId, targetPlaceId)) {
    throw new Error("Название Починка на Чюровке не найдено.");
  }

  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`UPDATE place_name_states
    SET place_id = ?, place_name_id = ?, position = 1 WHERE id = ?`)
    .run(targetPlaceId, targetNameId, stateId);
  db.prepare(`UPDATE mentions SET place_id = ?, match_reliability = 'exact'
    WHERE id = ? AND place_id = ?`)
    .run(targetPlaceId, mentionId, sourcePlaceId);
};
