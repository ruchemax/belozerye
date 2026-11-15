export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<h2 id="rent-sudbitsy" class="group-heading">Судбици<\/h2>)\s*<p class="record-prose">(<span class="source-note">\[опущено\]<\/span>\.)<\/p>/u;
  if (!pattern.test(document.html)) throw new Error("The Sudbitsy omission note was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(pattern, '<div class="heading-row heading-note-flow">$1 $2</div>'), bookId);
};
