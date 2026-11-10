export const up = (db) => {
  const sourceId = "derevnya-voltsovo-1626-9";
  const targetId = "ivantsovo";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-9";
  const stateId = `observed:${mentionId}:0`;

  const source = db.prepare("SELECT id FROM places WHERE id = ?").get(sourceId);
  const target = db.prepare("SELECT id FROM places WHERE id = ?").get(targetId);
  if (!source || !target) throw new Error("Карточка Волцова или Иванцова не найдена.");
  if (!db.prepare("SELECT id FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, sourceId)) {
    throw new Error("Ожидаемое упоминание Волцова за 1626/27 год не найдено.");
  }

  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`INSERT INTO place_names (id, place_id, name, language, name_kind)
    VALUES (?, ?, 'Волцово', 'ru', 'attested')`).run(
      "attested:ivantsovo:voltsovo-1626", targetId
    );
  db.prepare(`UPDATE place_name_states
    SET place_id = ?, place_name_id = ? WHERE id = ? AND place_id = ?`).run(
      targetId, "attested:ivantsovo:voltsovo-1626", stateId, sourceId
    );
  db.prepare("UPDATE mentions SET place_id = ? WHERE id = ? AND place_id = ?")
    .run(targetId, mentionId, sourceId);

  db.prepare("UPDATE places SET name = 'Иванцово', name_origin = 'editorial' WHERE id = ?")
    .run(targetId);

  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("DELETE FROM places WHERE id = ?").run(sourceId);
};
