export const formatDocument = (html) => {
  const original = ".document-body .potka-title { margin: 0 !important; padding: 0 !important; font: inherit !important; color: inherit !important; }";
  if (!html.includes(original)) throw new Error("The Potka title style was not found.");
  return html.replace(original, `.document-body .potka-title { margin: 0 !important; padding: 0 !important; }
.document-body .potka-title, .document-body .potka-title a { color: #9a3412 !important; font-size: 1.0625rem !important; font-weight: 600 !important; line-height: 1.5 !important; }`);
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
};
