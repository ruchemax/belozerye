export const formatDocument = (html) => {
  const original = ".document-body .potka-rent-summary { margin-block: .5rem 0 !important; }";
  if (!html.includes(original)) throw new Error("The Potka rent paragraph style was not found.");
  return html.replace(original, ".document-body #kirillov-1601-rent-summary { margin-block: .5rem 0 !important; }");
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
};
