export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  const original = '<strong class="person-name">Карп кузнец</strong>';
  if (!document.html.includes(original)) throw new Error("The expected Karp record was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, '<strong class="person-name">Карп</strong> кузнец'), bookId);
};
