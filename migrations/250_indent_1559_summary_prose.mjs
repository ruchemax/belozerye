export const formatDocument = (html) => {
  if (html.includes('id="summary-prose-indent-style"')) return html;
  const style = `<style id="summary-prose-indent-style">
.document-body > .record-prose,
.document-body .group-content > .record-prose {
  padding-inline-start: var(--book-prose-indent, 2rem) !important;
}
</style>`;
  return html.replace("</head>", `${style}</head>`);
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
