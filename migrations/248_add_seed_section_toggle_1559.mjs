export const formatDocument = (html) => {
  if (html.includes('id="body-seed"')) return html;
  const heading = /(<h1 id="seed" class="primary-section-heading">)([\s\S]*?)(<\/h1>)([\s\S]*?)(?=<h1 id="rent-charoma-title")/u;
  if (!heading.test(html)) throw new Error("The complete 1559 seed section was not found.");
  return html.replace(heading, (_match, opening, title, closing, content) =>
    `${opening}<button class="heading-toggle" type="button" data-body-toggle aria-controls="body-seed" aria-expanded="true" aria-label="Свернуть раздел"><span class="heading-toggle-icon" aria-hidden="true">▾</span></button>${title}${closing}<div class="group-content" id="body-seed">${content}</div>\n`);
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
