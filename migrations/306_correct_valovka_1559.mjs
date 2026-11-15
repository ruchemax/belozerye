export const up = (db) => {
  const bookId = "kirillov-1559";
  const mentionId = "kirillov-1559-mention-096";
  const placeId = "valovka-charomsky-1559";
  const name = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = ?").get(placeId, "Валовка");
  const mention = db.prepare("SELECT place_id, fragment_id FROM mentions WHERE id = ?").get(mentionId);
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!name || mention?.place_id !== placeId || !document?.html.includes("Заловка")) {
    throw new Error("The Valovka source record was not found.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll("Заловка", "Валовка"), bookId);
  db.prepare("UPDATE mentions SET source_name = ?, historical_name_override = NULL WHERE id = ?")
    .run("Деревня Валовка", mentionId);
  db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE source_mention_id = ?").run(name.id, mentionId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(mention.fragment_id);
  db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?")
    .run(fragment.raw_json.replaceAll("Заловка", "Валовка"), mention.fragment_id);
  db.prepare("DELETE FROM place_names WHERE place_id = ? AND name = ?").run(placeId, "Заловка");
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting Valovka.");
};
