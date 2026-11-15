export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const original = 'ячмени осмина. <span class="source-note">[пол-осмины]</span></p>';
  const replacement = 'ячмени осмина <span class="source-note">[пол-осмины]</span>.</p>';
  if (!document.html.includes(original)) throw new Error("The Anna sentence was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, replacement), bookId);
};
