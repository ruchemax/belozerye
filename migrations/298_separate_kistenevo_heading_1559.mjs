export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-058"><div class="record-heading-line">)([\s\S]*?)(<h3\b[\s\S]*?<\/h3>) <span class="heading-inline-prose">пол-2 выти\.<\/span><\/div><div class="record-body">/u;
  if (!pattern.test(document.html)) throw new Error("The Kistenevo heading was not found.");
  const html = document.html.replace(pattern,
    '$1$2<br>$3</div><div class="record-body">\n<p class="record-prose">пол-2 выти.</p>');
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
