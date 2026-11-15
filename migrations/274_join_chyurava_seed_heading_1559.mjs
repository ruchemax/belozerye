export const formatDocument = (html) => html.replace(
  /<p class="record-prose">Семяник ржаной и яровой\.<\/p>\s*(<h2 id="seed-chyurava"[^>]*>[\s\S]*?<span class="page-mark">\(л\. 125\)<\/span>) Ключ Чюравской\.<\/h2>/u,
  "$1 Семяник ржаной и яровой. Ключ Чюравской.</h2>"
).replace(
  /(<a\b[^>]*href="#seed-chyurava"[^>]*>)Ключ Чюравской(<\/a>)/u,
  "$1Семяник ржаной и яровой. Ключ Чюравской$2"
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
