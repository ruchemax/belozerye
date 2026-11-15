export const formatDocument = (html) => html.replace(
  /(<h1 id="rent-charoma-title"[^>]*>[\s\S]*?<\/button>)Оброчник Чяромского ключя всякого хлеба\.<\/h1>(<div class="group-content" id="body-rent-charoma-section">)\s*<h2 id="rent-charoma"[^>]*>[\s\S]*?<\/h2>/u,
  '$1<span class="page-mark" id="rent-charoma">(л. 244)</span> Оброчник Чяромского ключя всякого хлеба. Ключ Чяромской <span class="name-variant">[Чаромской]</span>.</h1>$2'
).replace(
  /(<a\b[^>]*href="#rent-charoma-title"[^>]*>)Оброчник Чяромского ключя всякого хлеба(<\/a>)/u,
  "$1Оброчник Чяромского ключя всякого хлеба. Ключ Чяромской [Чаромской]$2"
).replace(
  /<div class="contents-entry contents-level-2"[^>]*><a\b[^>]*href="#rent-charoma"[^>]*>Ключ Чяромской<\/a><\/div>\s*/u,
  ""
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
