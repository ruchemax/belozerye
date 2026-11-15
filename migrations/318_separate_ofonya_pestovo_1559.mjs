export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const original = 'овса 4 чети, <span class="page-mark">(л. 251)</span> <strong class="person-name">Офоня</strong>';
  const replacement = 'овса 4 чети.</p>\n<p class="record-prose"><span class="page-mark">(л. 251)</span> <strong class="person-name">Офоня</strong>';
  if (!document.html.includes(original)) throw new Error("The Ofonya record in Pestovo was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, replacement), bookId);
};
