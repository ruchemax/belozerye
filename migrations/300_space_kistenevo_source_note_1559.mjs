export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-058">)<div class="record-heading-line">([\s\S]*?)<br>(<h3\b)/u;
  if (!pattern.test(document.html)) throw new Error("The Kistenevo source note was not found.");
  const html = document.html.replace(pattern,
    '$1<div class="record-source-note">$2</div><div class="record-heading-line">$3');
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
