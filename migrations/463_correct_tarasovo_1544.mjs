export const up = (db) => {
  const bookId = "belozersky-1544";
  const mentionId = "mention-belozersky-1544-place-1-13";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id='tarasova' AND name='Тарасово'").get();
  if (!document?.html.includes("Тарасовы [Тарасова]") || !name) throw new Error("The Tarasovo source or name was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?")
    .run(document.html.replaceAll("Тарасовы [Тарасова]","Тарасовы [Тарасово]"),bookId);
  db.prepare("UPDATE mentions SET source_name=?,historical_name_override=? WHERE id=?")
    .run("Деревня Тарасовы [Тарасово]","Деревня Тарасово",mentionId);
  db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=?")
    .run(name.id,mentionId);
};
