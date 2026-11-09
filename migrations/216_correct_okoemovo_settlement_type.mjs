export const up = (db) => {
  const bookId = "belozersky-1626";
  const original = "Деревни Окоемово";
  const corrected = "Деревня Окоемово";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes(original)) {
    throw new Error("The Okoemovo heading was not found in the 1626 book text.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll(original, corrected), bookId);
  db.prepare("UPDATE mentions SET source_name = replace(source_name, ?, ?) WHERE place_id = 'okoemovo'")
    .run(original, corrected);
};
