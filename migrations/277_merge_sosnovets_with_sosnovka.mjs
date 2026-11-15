export const up = (db) => {
  const source = "sosnovets-1559";
  const target = "sosnovka-monastery";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(target)) throw new Error("The Sosnovka card was not found.");
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(source)) return;
  db.exec("PRAGMA defer_foreign_keys = ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS n FROM place_name_states WHERE place_id = ?").get(target).n;
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?").run(target, offset, source);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(target, source);
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE place_id = ?").run(target, source);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(target, source);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(target, source);
  db.prepare(`INSERT OR IGNORE INTO place_geometries (place_id, longitude, latitude)
    SELECT ?, longitude, latitude FROM place_geometries WHERE place_id = ?`).run(target, source);
  db.prepare("DELETE FROM place_geometries WHERE place_id = ?").run(source);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents WHERE instr(html, ?) > 0").all(`/places/${source}/`)) {
    db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
      .run(document.html.replaceAll(`/places/${source}/`, `/places/${target}/`), document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(source);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after merging Sosnovets and Sosnovka.");
};
