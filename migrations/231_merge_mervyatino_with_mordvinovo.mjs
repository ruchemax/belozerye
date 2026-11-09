export const up = (db) => {
  const sourceId = "mervyatino";
  const targetId = "pustosh-mordvinovo-1626-88";
  for (const id of [sourceId, targetId]) {
    if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(id)) {
      throw new Error(`The place ${id} required for the Mordvinovo merge was not found.`);
    }
  }
  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?")
    .get(targetId).value;
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?")
    .run(targetId, offset, sourceId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll(`/places/${sourceId}/`, `/places/${targetId}/`);
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(sourceId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after the Mordvinovo merge.");
};
