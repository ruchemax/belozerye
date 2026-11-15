export const up = (db) => {
  const source = "pustosh-semenova-1626-60";
  const target = "senkin";
  for (const id of [source, target]) {
    if (!db.prepare("SELECT 1 FROM places WHERE id=?").get(id)) throw new Error(`Place not found: ${id}.`);
  }
  db.exec("PRAGMA defer_foreign_keys=ON");
  const offset = db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS n FROM place_name_states WHERE place_id=?").get(target).n;
  db.prepare("UPDATE place_name_states SET place_id=?,position=position+? WHERE place_id=?").run(target, offset, source);
  for (const name of db.prepare("SELECT id,name FROM place_names WHERE place_id=?").all(source)) {
    const existing = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name=?").get(target, name.name);
    if (existing) {
      db.prepare("UPDATE place_name_states SET place_name_id=? WHERE place_name_id=?").run(existing.id, name.id);
      db.prepare("DELETE FROM place_names WHERE id=?").run(name.id);
    } else db.prepare("UPDATE place_names SET place_id=? WHERE id=?").run(target, name.id);
  }
  db.prepare("UPDATE mentions SET place_id=?,match_reliability='exact' WHERE place_id IN (?,?)").run(target, source, target);
  db.prepare("UPDATE churches SET location_place_id=? WHERE location_place_id=?").run(target, source);
  db.prepare("UPDATE land_owners SET location_place_id=? WHERE location_place_id=?").run(target, source);
  db.prepare(`INSERT OR IGNORE INTO place_geometries (place_id,longitude,latitude,location_note)
    SELECT ?,longitude,latitude,location_note FROM place_geometries WHERE place_id=?`).run(target, source);
  db.prepare("DELETE FROM place_geometries WHERE place_id=?").run(source);
  db.prepare(`UPDATE places SET name=(SELECT name FROM places WHERE id=?),
    type_code=(SELECT type_code FROM places WHERE id=?),name_origin='observed' WHERE id=?`).run(source, source, target);
  for (const document of db.prepare("SELECT book_id,html FROM book_documents WHERE instr(html,?)>0").all(`/places/${source}/`)) {
    db.prepare("UPDATE book_documents SET html=? WHERE book_id=?")
      .run(document.html.replaceAll(`/places/${source}/`, `/places/${target}/`), document.book_id);
  }
  db.prepare("UPDATE fragments SET link_target_id=? WHERE link_target_id=?").run(target, source);
  db.prepare("DELETE FROM places WHERE id=?").run(source);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after merging Senkin with Semenova.");
};
