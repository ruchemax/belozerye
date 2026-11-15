export const formatDocument = (html) => html.replaceAll(
  "Бориса Федоровича", '<strong class="person-name">Бориса Федоровича</strong>'
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document || !document.html.includes("Бориса Федоровича")) throw new Error("The Boris Fedorovich passage was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
};
