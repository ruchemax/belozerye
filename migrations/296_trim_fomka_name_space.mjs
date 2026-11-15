export const up = (db) => {
  const bookId = "belozersky-1544";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1544 book was not found.");
  const pattern = /(Во дворе брат его <strong\b[^>]*>Фомка) +(<\/strong>\.)/u;
  if (!pattern.test(document.html)) throw new Error("The space after Fomka was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(pattern, "$1$2"), bookId);
};
