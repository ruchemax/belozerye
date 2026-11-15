export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-096">[\s\S]*?<span class="heading-inline-prose">)полвыти ([\s\S]*?)<\/span><\/div><div class="record-body">/u;
  if (!pattern.test(document.html)) throw new Error("The Valovka rent heading was not found.");
  const html = document.html.replace(pattern,
    '$1полвыти.</span></div><div class="record-body">\n<p class="record-prose">$2</p>');
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
