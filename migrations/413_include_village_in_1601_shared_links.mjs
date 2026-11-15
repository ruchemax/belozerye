export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1601-fragment-049-heading"[^>]*>)([\s\S]*?)(<\/h3>)/u,
  (_, opening, content, closing) => opening + content.replace(/<\/?a\b[^>]*>/gu, "")
    .replace("Деревня Заречье", '<a class="place-title-link" href="../../places/larino/">Деревня Заречье</a>')
    .replace("деревня Селища", '<a class="place-title-link" href="../../places/selishche/">деревня Селища</a>') + closing
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The shared village heading was not found or already formatted.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
};
