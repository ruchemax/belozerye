export const up = (db) => {
  const source = "samsonova-dubrovka";
  const target = "pustosh-morozovo-1626-91";
  for (const placeId of [source, target]) {
    if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
      throw new Error(`Place not found: ${placeId}`);
    }
  }
  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS n FROM place_name_states WHERE place_id = ?").get(target).n;
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?").run(target, offset, source);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(target, source);
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'probable' WHERE place_id = ?").run(target, source);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(target, source);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(target, source);
  db.prepare(`INSERT OR IGNORE INTO place_geometries (place_id, longitude, latitude)
    SELECT ?, longitude, latitude FROM place_geometries WHERE place_id = ?`).run(target, source);
  db.prepare("DELETE FROM place_geometries WHERE place_id = ?").run(source);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents WHERE instr(html, ?) > 0").all(`/places/${source}/`)) {
    db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
      .run(document.html.replaceAll(`/places/${source}/`, `/places/${target}/`), document.book_id);
  }
  const latest = db.prepare(`SELECT n.name FROM place_name_states s
    JOIN place_names n ON n.id = s.place_name_id
    WHERE s.place_id = ? AND s.assertion_kind = 'observed'
    ORDER BY CAST(s.observed_year AS INTEGER) DESC, s.position DESC LIMIT 1`).get(target);
  if (!latest) throw new Error("No observed name found for the merged card.");
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed' WHERE id = ?").run(latest.name, target);
  db.prepare("DELETE FROM places WHERE id = ?").run(source);
  if (db.prepare("PRAGMA foreign_key_check").all().length) {
    throw new Error("Invalid references after merging Samsonova Dubrovka with Morozovo.");
  }
};
