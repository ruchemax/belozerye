export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-skorobagatoe">)<div class="record-source-note">([\s\S]*?)<\/div><div class="record-heading-line">/u;
  if (!pattern.test(document.html)) throw new Error("The Skorobagatoe heading and source note were not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(pattern, '$1<div class="record-heading-line">$2 '), bookId);
};
