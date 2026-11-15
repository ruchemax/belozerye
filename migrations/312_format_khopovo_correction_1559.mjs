export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const original = "С Хлопова (исправлено, в рукописи: Хопово)";
  if (!document.html.includes(original)) throw new Error("The Khopovo correction was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, 'С Хопово <span class="source-note">[Хлопово]</span>'), bookId);
};
