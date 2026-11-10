export const up = (db) => {
  const sourceId = "filino";
  const targetId = "olekseeva";
  const mentionId = "mention-belozersky-1544-place-1-12";
  const stateId = `observed:${mentionId}`;
  const sourceNameId = "attested:filino:154";
  const targetNameId = "attested:belozersky-1626-mention-folios-547-561-place-7:0";

  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(sourceId)
    || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)) {
    throw new Error("Карточка Филина или Олексеева не найдена.");
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, sourceId)
    || !db.prepare("SELECT 1 FROM place_name_states WHERE id = ? AND place_id = ?").get(stateId, sourceId)
    || !db.prepare("SELECT 1 FROM place_names WHERE id = ? AND place_id = ?").get(sourceNameId, sourceId)) {
    throw new Error("Упоминание Филина не найдено в ожидаемом виде.");
  }
  if (!db.prepare("SELECT 1 FROM place_names WHERE id = ? AND place_id = ?").get(targetNameId, targetId)) {
    throw new Error("Название Олексеева не найдено.");
  }

  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare("UPDATE place_name_states SET place_id = ?, place_name_id = ?, position = 1 WHERE id = ?")
    .run(targetId, targetNameId, stateId);
  db.prepare(`UPDATE mentions SET place_id = ?, match_reliability = 'exact'
    WHERE id = ? AND place_id = ?`)
    .run(targetId, mentionId, sourceId);
  db.prepare("DELETE FROM place_names WHERE id = ?").run(sourceNameId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("DELETE FROM places WHERE id = ?").run(sourceId);
};
