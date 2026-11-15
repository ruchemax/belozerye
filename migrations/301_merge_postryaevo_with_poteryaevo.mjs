export const up = (db) => {
  const source = "pustosh-postryaevo-1626-102";
  const target = "poteryaevo";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-102";
  const name = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = ?").get(target, "Потеряево");
  if (!name || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(source)) {
    throw new Error("The Postryaevo or Poteryaevo card was not found.");
  }
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
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    let html = document.html.replaceAll(`/places/${source}/`, `/places/${target}/`);
    if (document.book_id === "belozersky-1626") {
      html = html.replaceAll("Пустошь Постряево", "Пустошь Постряево [Потеряево]");
    }
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("UPDATE mentions SET source_name = ?, historical_name_override = ? WHERE id = ?")
    .run("Пустошь Постряево [Потеряево]", "Пустошь Потеряево", mentionId);
  db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE source_mention_id = ?").run(name.id, mentionId);
  const fragmentId = db.prepare("SELECT fragment_id FROM mentions WHERE id = ?").get(mentionId).fragment_id;
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "Пустошь Постряево [Потеряево]" }), fragmentId);
  db.prepare("DELETE FROM places WHERE id = ?").run(source);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after merging Postryaevo with Poteryaevo.");
};
