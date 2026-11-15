export const up = (db) => {
  const bookId = "kirillov-1601";
  const book = db.prepare("SELECT publication_reference FROM books WHERE id = ?").get(bookId);
  if (!book) throw new Error("The 1601 book was not found.");
  const publicationReference = book.publication_reference.replace(
    "С. 377–381 (л. 37об.–45).", "С. 357–434."
  );
  if (publicationReference === book.publication_reference) {
    throw new Error("The expected 1601 publication reference was not found.");
  }
  db.prepare("UPDATE books SET archive_reference = ?, publication_reference = ? WHERE id = ?").run(
    "ГПБ. Ф. 351. № 70/1309. Лл. 1–157об.", publicationReference, bookId
  );
};
