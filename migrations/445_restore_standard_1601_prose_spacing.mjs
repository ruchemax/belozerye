export const formatDocument = (html) => html.replace(
  /<style id="census-village-totals-spacing">[\s\S]*?<\/style>/u, ""
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The compact prose spacing override was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
};
