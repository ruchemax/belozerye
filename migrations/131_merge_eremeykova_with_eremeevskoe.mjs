export const up = (db) => {
  const targetId = "eremeevskoe";
  const oldId = "derevnya-eremeykova-1626-22";
  const latest = db.prepare("SELECT name, name_origin, type_code FROM places WHERE id = ?").get(oldId);
  if (!latest || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)) throw new Error("Both settlement cards are required for the Eremeykova merge.");
  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?").get(targetId).value;
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?")
    .run(targetId, offset, oldId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, oldId);
  db.prepare("UPDATE places SET name = ?, name_origin = ?, type_code = ? WHERE id = ?")
    .run(latest.name, latest.name_origin, latest.type_code, targetId);
  const point = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(oldId);
  if (point) db.prepare("INSERT OR IGNORE INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)")
    .run(targetId, point.longitude, point.latitude);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll(`/places/${oldId}/`, `/places/${targetId}/`);
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after the Eremeykova merge.");
};
