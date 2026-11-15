export const up = (db) => {
  const bookId = "kirillov-1559";
  const book = db.prepare("SELECT publication_reference FROM books WHERE id = ?").get(bookId);
  if (!book?.publication_reference) throw new Error("The 1559 publication reference was not found.");
  const reference = book.publication_reference.replace(/[ \u00a0\u202f]+(?=[:;])/gu, "");
  db.prepare("UPDATE books SET publication_reference = ? WHERE id = ?").run(reference, bookId);
};
