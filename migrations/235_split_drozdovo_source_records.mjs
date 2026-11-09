export const up = (db) => {
  const originalId = "drozdovo";
  const placeId = "drozdovo-churovka";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-14";
  const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
  const states = db.prepare("SELECT id FROM place_name_states WHERE source_mention_id = ?").all(mentionId);
  if (mention?.place_id !== originalId || states.length !== 1) {
    throw new Error("The 1626 Drozdovo record was not found on the combined card.");
  }
  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Дроздово', 'observed', 'village', 'unknown')`).run(placeId, placeId);
  const nameId = "attested:drozdovo-churovka:1626";
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, 'Дроздово', 'ru', 'attested')")
    .run(nameId, placeId);
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?").run(placeId, mentionId);
  db.prepare("UPDATE place_name_states SET place_id = ?, place_name_id = ?, position = 0 WHERE source_mention_id = ?")
    .run(placeId, nameId, mentionId);
  db.prepare("UPDATE places SET type_code = 'pochinok' WHERE id = ?").run(originalId);

  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626 book document was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll(`/places/${originalId}/`, `/places/${placeId}/`), bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after splitting Drozdovo.");
};
