export const up = (db) => {
  const targetId = "dor";
  const oldId = "dor-levashev";
  const readPlace = db.prepare("SELECT id FROM places WHERE id = ?");
  if (!readPlace.get(targetId) || !readPlace.get(oldId)) {
    throw new Error("Both Dor settlement records are required for the merge.");
  }

  // Name states reference both the name and mention with their settlement ID.
  // Defer these checks until all three records have moved together.
  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?").get(targetId).value;
  db.prepare("UPDATE mentions SET place_id = ? WHERE place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?").run(targetId, offset, oldId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE fragments SET link_target_id = ? WHERE link_target_id = ?").run(targetId, oldId);

  const oldGeometry = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(oldId);
  if (oldGeometry) {
    db.prepare("INSERT OR IGNORE INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)").run(targetId, oldGeometry.longitude, oldGeometry.latitude);
  }
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll("/places/dor-levashev/", "/places/dor/");
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) {
    throw new Error("Settlement merge left invalid foreign keys.");
  }
};
