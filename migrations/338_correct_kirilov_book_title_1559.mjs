export const up = (db) => {
  const bookId = "kirillov-1559";
  const book = db.prepare("SELECT full_title, short_title, raw_json FROM books WHERE id = ?").get(bookId);
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!book || !document) throw new Error("The 1559 book was not found.");
  const correct = (text) => text.replaceAll("Кириллова монастыря", "Кирилова монастыря");
  db.prepare("UPDATE books SET full_title = ?, short_title = ?, raw_json = ? WHERE id = ?")
    .run(correct(book.full_title), correct(book.short_title), correct(book.raw_json), bookId);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(correct(document.html), bookId);
};
