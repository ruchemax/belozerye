export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const opening = '<p class="record-prose">И всего оброчнего хлеба на Колинце ржы 26';
  if (!document?.html.includes(opening)) throw new Error("The Kolinets rent summary was not found.");
  const html = document.html.replace(opening,
    '<p class="record-prose" id="kolinets-rent-summary">И всего оброчнего хлеба на Колинце ржы 26')
    .replace("</head>",'<style id="kolinets-rent-summary-style">.document-body #kolinets-rent-summary { margin-block-start:1.5rem!important; }</style></head>');
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
};
