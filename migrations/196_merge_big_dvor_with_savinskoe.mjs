export const up = (db) => {
  const savinskoeId = "savinskoe";
  const moshkovId = "moshkov";
  const moshkovMentionId = "mention-belozersky-1544-place-10-10";
  const bigDvorId = "pustosh-bollshoy-bolshoy-dvor-na-rechke-na-pizdavke-1626-39";
  const bigDvorMentionId = "belozersky-1626-mention-folios-547-561-place-39";

  if (db.prepare("SELECT 1 FROM places WHERE id = ?").get(moshkovId)) {
    throw new Error("Moshkov should be restored as its own place before this correction.");
  }
  const moshkovMention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(moshkovMentionId);
  if (moshkovMention?.place_id !== savinskoeId) throw new Error("The incorrectly merged Moshkov mention was not found on Savinskoe.");
  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare("INSERT INTO places (id, slug, name, name_origin, type_code, status_code) VALUES (?, ?, 'Мошков', 'observed', 'village', 'unknown')")
    .run(moshkovId, moshkovId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE id = 'attested:moshkov:237'").run(moshkovId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = 0 WHERE id = 'observed:mention-belozersky-1544-place-10-10'")
    .run(moshkovId);
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'unreviewed' WHERE id = ?")
    .run(moshkovId, moshkovMentionId);

  const sourceDocument = db.prepare("SELECT html FROM book_documents WHERE book_id = 'belozersky-1544'").get();
  const mergedSourceLink = '<a class="place-title-link" href="../../places/savinskoe/" data-astro-cid-zcak6nys>Починок Мошков</a>';
  if (!sourceDocument?.html.includes(mergedSourceLink)) throw new Error("The Moshkov source link could not be restored.");
  db.prepare("UPDATE book_documents SET html = replace(html, ?, ?) WHERE book_id = 'belozersky-1544'")
    .run(mergedSourceLink, mergedSourceLink.replace("places/savinskoe", "places/moshkov"));

  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(savinskoeId)
      || !db.prepare("SELECT 1 FROM places WHERE id = ?").get(bigDvorId)) {
    throw new Error("Both Savinskoe and Bolshoy Dvor cards are required for the merge.");
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(bigDvorMentionId, bigDvorId)) {
    throw new Error("The Bolshoy Dvor source record is not linked to its expected card.");
  }
  const latest = db.prepare("SELECT name, type_code FROM places WHERE id = ?").get(bigDvorId);
  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?")
    .get(savinskoeId).value;
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE place_id = ?")
    .run(savinskoeId, bigDvorId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(savinskoeId, bigDvorId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE place_id = ?")
    .run(savinskoeId, offset, bigDvorId);
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed', type_code = ? WHERE id = ?")
    .run(latest.name, latest.type_code, savinskoeId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(savinskoeId, bigDvorId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(savinskoeId, bigDvorId);
  const point = db.prepare("SELECT longitude, latitude FROM place_geometries WHERE place_id = ?").get(bigDvorId);
  if (point) db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(savinskoeId, point.longitude, point.latitude);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll(`/places/${bigDvorId}/`, `/places/${savinskoeId}/`);
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(bigDvorId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after merging the Big Dvor cards.");
};
