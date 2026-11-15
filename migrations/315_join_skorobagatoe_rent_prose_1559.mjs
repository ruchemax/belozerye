export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-skorobagatoe">[\s\S]*?<span class="heading-inline-prose">полвыти\.)<\/span><\/div><div class="record-body">\s*<p class="record-prose">(Рядчики положили оброку лета 7070-го ново 3 осмины ржи, 3 чети овса, осмина ячменя\.)<\/p>/u;
  if (!pattern.test(document.html)) throw new Error("The Skorobagatoe rent prose was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(pattern, '$1 $2</span></div><div class="record-body">'), bookId);
};
