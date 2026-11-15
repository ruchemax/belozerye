export const up = (db) => {
  const originalId = "pochinok-kharlamov-u-kolentsa";
  const placeId = "kharlamovo";
  const retainedMention = "mention-belozersky-1544-place-4-4";
  const retained = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(retainedMention);
  if (retained?.place_id !== originalId) throw new Error("The Kharlamov at Kolenets record was not found.");
  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Харламово', 'observed', 'village', 'unknown')`).run(placeId, placeId);
  const mentions = db.prepare("SELECT id FROM mentions WHERE place_id = ? AND id <> ?").all(originalId, retainedMention);
  for (const [position, mention] of mentions.entries()) {
    for (const state of db.prepare("SELECT id, place_name_id FROM place_name_states WHERE source_mention_id = ?").all(mention.id)) {
      db.prepare("UPDATE place_names SET place_id = ? WHERE id = ?").run(placeId, state.place_name_id);
      db.prepare("UPDATE place_name_states SET place_id = ?, position = ? WHERE id = ?").run(placeId, position, state.id);
    }
    db.prepare("UPDATE mentions SET place_id = ? WHERE id = ?").run(placeId, mention.id);
  }
  db.prepare("UPDATE places SET name = 'Починок Харламов у Коленца' WHERE id = ?").run(originalId);
  for (const bookId of ["kirillov-1559", "belozersky-1626"]) {
    const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
    if (!document) throw new Error(`Missing book ${bookId}.`);
    db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
      .run(document.html.replaceAll(`/places/${originalId}/`, `/places/${placeId}/`), bookId);
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after separating Kharlamov at Kolenets.");
};
