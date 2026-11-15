export const formatDocument = (html) => html.replaceAll("(1601)", "(1601 г.)");

export const up = (db) => {
  const bookId = "kirillov-1601";
  const book = db.prepare("SELECT short_title,full_title FROM books WHERE id=?").get(bookId);
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!book || !document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE books SET short_title=?,full_title=? WHERE id=?")
    .run(formatDocument(book.short_title),formatDocument(book.full_title),bookId);
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
};
