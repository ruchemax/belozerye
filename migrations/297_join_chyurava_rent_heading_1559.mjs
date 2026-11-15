export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<h1 id="rent-chyurava-title"[^>]*>[\s\S]*?)(<\/h1><div class="group-content" id="body-rent-chyurava-section">)\s*<h2 id="rent-chyurava"[^>]*>[\s\S]*?<\/h2>/u;
  if (!pattern.test(document.html)) throw new Error("The Chyurava rent headings were not found.");
  const html = document.html.replace(pattern,
    '$1 <span id="rent-chyurava">Ключ Чюравской.</span>$2')
    .replace(/(<a\b[^>]*href="#rent-chyurava-title"[^>]*>)[\s\S]*?(<\/a>)/u,
      "$1Оброчник Чюравского ключа всякого хлеба [Оброчник хлебной Чюравской]. Ключ Чюравской$2")
    .replace(/<div class="contents-entry contents-level-2"[^>]*><a\b[^>]*href="#rent-chyurava"[^>]*>[\s\S]*?<\/a><\/div>\s*/u, "");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
