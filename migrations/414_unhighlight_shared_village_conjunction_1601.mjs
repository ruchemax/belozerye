export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1601-fragment-049-heading"[^>]*>)([\s\S]*?)(<\/h3>)/u,
  (_, opening, content, closing) => opening + content.replace(
    "</a> да <a", '</a> <span class="heading-inline-prose">да</span> <a'
  ) + closing
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The shared village conjunction was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
};
