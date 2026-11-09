export const up = (db) => {
  const sourceId = "uvarova-gorka";
  const targetId = "derevnya-gorka-na-rechke-na-ulomke-1626-4";
  for (const id of [sourceId, targetId]) {
    if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(id)) {
      throw new Error(`The Gorka place ${id} was not found.`);
    }
  }
  const coordinates = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(targetId);
  if (!coordinates) throw new Error("The Gorka coordinates to preserve were not found.");

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
  const preserved = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(targetId);
  if (preserved.longitude !== coordinates.longitude || preserved.latitude !== coordinates.latitude) {
    throw new Error("The Gorka coordinates changed during the merge.");
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after the Gorka merge.");
};
