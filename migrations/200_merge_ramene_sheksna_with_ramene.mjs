export const up = (db) => {
  const targetId = "ramene";
  const oldId = "ramene-sheksna";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-41";
  const kolenetsId = "subdivision:Коленца";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)
      || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(oldId)) {
    throw new Error("Both Ramene cards are required for the merge.");
  }
  const latest = db.prepare(`SELECT names.name, states.type_code
    FROM place_name_states AS states JOIN place_names AS names ON names.id = states.place_name_id
    WHERE states.source_mention_id = ? AND states.assertion_kind = 'observed'`).get(mentionId);
  if (!latest || !db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, oldId)) {
    throw new Error("The Sheksna Ramene source record is not linked to its expected card.");
  }
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ? AND kind = 'subdivision'").get(kolenetsId)) {
    throw new Error("The Kolenets subdivision was not found.");
  }

  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?")
    .get(targetId).value;
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE place_id = ?")
    .run(targetId, oldId);
  for (const name of db.prepare("SELECT id, name FROM place_names WHERE place_id = ?").all(oldId)) {
    const existing = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = ?").get(targetId, name.name);
    if (existing) {
      db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE place_name_id = ?").run(existing.id, name.id);
      db.prepare("DELETE FROM place_names WHERE id = ?").run(name.id);
    } else {
      db.prepare("UPDATE place_names SET place_id = ? WHERE id = ?").run(targetId, name.id);
    }
  }
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?")
    .run(targetId, offset, oldId);
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed', type_code = ? WHERE id = ?")
    .run(latest.name, latest.type_code, targetId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  const point = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(oldId);
  if (point) db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO NOTHING`).run(targetId, point.longitude, point.latitude);
  db.prepare(`DELETE FROM mention_administrative_units
    WHERE mention_id = ? AND administrative_unit_id = 'volost:Чуровская' AND context_key = 'volost'`)
    .run(mentionId);
  db.prepare(`INSERT OR IGNORE INTO mention_administrative_units
    (mention_id, administrative_unit_id, context_key) VALUES (?, ?, 'subdivision')`)
    .run(mentionId, kolenetsId);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll(`/places/${oldId}/`, `/places/${targetId}/`);
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after the Ramene merge.");
};
