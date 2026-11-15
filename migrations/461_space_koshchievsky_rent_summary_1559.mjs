export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const opening = '<p class="record-prose">И всего оброку в Кощиевском ключе ржы 100';
  if (!document?.html.includes(opening)) throw new Error("The Koshchievsky rent summary was not found.");
  const html = document.html.replace(opening,
    '<p class="record-prose" id="koshchievsky-rent-summary">И всего оброку в Кощиевском ключе ржы 100')
    .replace("</head>",'<style id="koshchievsky-rent-summary-style">.document-body #koshchievsky-rent-summary { margin-block-start:1.5rem!important; }</style></head>');
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
};
