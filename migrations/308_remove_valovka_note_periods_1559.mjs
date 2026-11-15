export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const original = '(…). <span class="source-note">[полвыти пуста, свели на монастырь, оброку идет.]</span>';
  const replacement = '(…) <span class="source-note">[полвыти пуста, свели на монастырь, оброку идет]</span>';
  if (!document.html.includes(original)) throw new Error("The Valovka source note was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, replacement), bookId);
};
