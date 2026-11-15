export const formatDocument = (html) => html.replaceAll("Бовыжино", "Бовыкино");

export const up = (db) => {
  const bookId = "kirillov-1559";
  const mentionId = "kirillov-1559-mention-066";
  const fragmentId = "kirillov-1559-fragment-066";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
  db.prepare("UPDATE mentions SET source_name = 'Деревня Бовыкино' WHERE id = ?").run(mentionId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "Деревня Бовыкино" }), fragmentId);
  db.prepare("UPDATE place_names SET name = 'Бовыкино' WHERE place_id = 'bovynin' AND name = 'Бовыжино'").run();
};
