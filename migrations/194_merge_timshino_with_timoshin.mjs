export const up = (db) => {
  const targetId = "timoshin";
  const oldId = "pustosh-timshino-1626-106";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-106";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)
      || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(oldId)) {
    throw new Error("Both Timoshin and Timshino cards are required for the merge.");
  }
  const latest = db.prepare(`SELECT names.name, states.type_code
    FROM place_name_states AS states JOIN place_names AS names ON names.id = states.place_name_id
    WHERE states.source_mention_id = ? AND states.assertion_kind = 'observed'`).get(mentionId);
  if (!latest || !db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, oldId)) {
    throw new Error("The Timshino source record is not linked to its expected card.");
  }
  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?")
    .get(targetId).value;
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE place_id = ?")
    .run(targetId, oldId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?")
    .run(targetId, offset, oldId);
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed', type_code = ? WHERE id = ?")
    .run(latest.name, latest.type_code, targetId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  const point = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(oldId);
  if (point) db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(targetId, point.longitude, point.latitude);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll(`/places/${oldId}/`, `/places/${targetId}/`);
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after the Timshino merge.");
};
