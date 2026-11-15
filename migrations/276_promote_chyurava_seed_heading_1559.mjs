export const formatDocument = (html) => html
  .replace(/<h2 id="seed-chyurava" class="group-heading">([\s\S]*?)<\/h2>/u,
    '<h1 id="seed-chyurava" class="primary-section-heading">$1</h1>')
  .replace(/<div class="contents-entry contents-level-2"([^>]*data-contents-level=")2("[^>]*><a\b[^>]*href="#seed-chyurava"[^>]*>)/u,
    '<div class="contents-entry contents-level-1"$11$2')
  .replace('aria-controls="body-seed"', 'aria-controls="body-seed-charoma"')
  .replace('<div class="group-content" id="body-seed"><div class="group-content" id="body-seed-charoma">',
    '<div class="group-content" id="body-seed-charoma">')
  .replace(/<\/div>\s*<\/div>\s*(?=<h1 id="rent-charoma-title")/u, "</div>\n");

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
