export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const heading = '<h2 id="rent-sudbitsy" class="group-heading">';
  const bodyStart = '<span class="source-note">[опущено]</span>.</div>';
  const bodyEnd = '<p class="record-prose">И всех деревень оброчных в Чюравском ключе 22.';
  if (![heading, bodyStart, bodyEnd].every(text => document.html.includes(text))) {
    throw new Error("The Sudbitsy section boundaries were not found.");
  }
  const toggle = '<button class="heading-toggle" type="button" data-body-toggle aria-controls="body-rent-sudbitsy" aria-expanded="true" aria-label="Свернуть раздел"><span class="heading-toggle-icon" aria-hidden="true">▾</span></button>';
  const html = document.html.replace(heading, heading + toggle)
    .replace(bodyStart, bodyStart + '<div class="group-content" id="body-rent-sudbitsy">')
    .replace(bodyEnd, '</div>\n' + bodyEnd);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
