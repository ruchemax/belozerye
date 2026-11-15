export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-058">[\s\S]*?<\/h3>)<\/div><div class="record-body">\s*<p class="record-prose">пол-2 выти\.<\/p>/u;
  if (!pattern.test(document.html)) throw new Error("The Kistenevo acreage was not found.");
  const html = document.html.replace(pattern,
    '$1 <span class="heading-inline-prose">пол-2 выти.</span></div><div class="record-body">');
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
