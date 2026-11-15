export const formatDocument = (html) => html.replace(
  /(<h1 id="seed"[^>]*>[\s\S]*?<\/button>)Семянник ржаной и яровой\.<\/h1>(<div class="group-content" id="body-seed">)\s*<h2 id="seed-charoma"[^>]*>[\s\S]*?<\/h2>/u,
  '$1<span class="page-mark" id="seed-charoma">(л. 120)</span> Семянник ржаной и яровой. Ключ Чяромской.</h1>$2'
).replace(
  /(<a\b[^>]*href="#seed"[^>]*>)Семянник ржаной и яровой(<\/a>)/u,
  "$1Семянник ржаной и яровой. Ключ Чяромской$2"
).replace(
  /<div class="contents-entry contents-level-2"[^>]*><a\b[^>]*href="#seed-charoma"[^>]*>Ключ Чяромской<\/a><\/div>\s*/u,
  ""
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
