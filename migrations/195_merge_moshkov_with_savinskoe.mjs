export const up = (db) => {
  const targetId = "savinskoe";
  const oldId = "moshkov";
  const mentionId = "mention-belozersky-1544-place-10-10";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)
      || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(oldId)) {
    throw new Error("Both Moshkov and Savinskoe cards are required for the merge.");
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, oldId)) {
    throw new Error("The Moshkov source record is not linked to its expected card.");
  }
  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?")
    .get(targetId).value;
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?")
    .run(targetId, mentionId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?")
    .run(targetId, offset, oldId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  const point = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(oldId);
  if (point) db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO NOTHING`).run(targetId, point.longitude, point.latitude);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll(`/places/${oldId}/`, `/places/${targetId}/`);
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after the Moshkov merge.");
};
