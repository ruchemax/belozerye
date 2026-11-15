export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const opening = '<p class="record-prose">И всех деревень оброчных в Чюравском ключе 22.';
  const previousStyle = '<style id="sizma-rent-summary-style">.document-body #sizma-rent-summary { margin-block-start:1.5rem!important; }</style>';
  if (!document?.html.includes(opening) || !document.html.includes(previousStyle)) {
    throw new Error("The rent summary or its previous spacing style was not found.");
  }
  const html = document.html
    .replace('<p class="record-prose" id="sizma-rent-summary">', '<p class="record-prose">')
    .replace(opening, '<p class="record-prose" id="chyurava-rent-summary">И всех деревень оброчных в Чюравском ключе 22.')
    .replace(previousStyle, '<style id="chyurava-rent-summary-style">.document-body #chyurava-rent-summary { margin-block-start:1.5rem!important; }</style>');
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
