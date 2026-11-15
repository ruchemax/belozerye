export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-096">[\s\S]*?ячмени осмина\.)<\/p>\s*<p class="record-prose">И всего 5 чети\.<\/p>/u;
  if (!pattern.test(document.html)) throw new Error("The Valovka rent total was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(pattern, "$1 И всего 5 чети.</p>"), bookId);
};
