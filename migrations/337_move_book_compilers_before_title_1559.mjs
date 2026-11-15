export const up = (db) => {
  const bookId = "kirillov-1559";
  const book = db.prepare("SELECT publication_reference FROM books WHERE id = ?").get(bookId);
  if (!book?.publication_reference) throw new Error("The 1559 publication reference was not found.");
  const responsibility = " / сост. А.Х. Горфункель, З.В. Дмитриева ; под ред.";
  const compactResponsibility = " / сост. А.Х. Горфункель, З.В. Дмитриева; под ред.";
  const original = book.publication_reference;
  if (!original.includes(compactResponsibility) && !original.includes(responsibility)) {
    throw new Error("The book compilers were not found in the publication reference.");
  }
  const reference = original
    .replace("// Вотчинные", "// Горфункель А.Х., Дмитриева З.В. (сост.). Вотчинные")
    .replace(compactResponsibility, " / под ред.")
    .replace(responsibility, " / под ред.");
  db.prepare("UPDATE books SET publication_reference = ? WHERE id = ?").run(reference, bookId);
};
