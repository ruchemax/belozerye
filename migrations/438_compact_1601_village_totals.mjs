export const formatDocument = (html) => {
  const start = html.indexOf('<p class="record-prose" id="census-villages-summary">');
  const end = html.indexOf('<h2 id="wastelands"', start);
  if (start < 0 || end < 0) throw new Error("The 1601 village totals boundaries were not found.");
  const style = `<style id="census-village-totals-spacing">
.document-body #census-village-totals > :is(.record-prose, .potka-rent-summary) { margin-block-end: 0 !important; }
.document-body #census-village-totals > :is(.record-prose, .potka-rent-summary) + :is(.record-prose, .potka-rent-summary) { margin-block-start: .25rem !important; }
</style>`;
  return (html.slice(0,start) + '<div class="group-content" id="census-village-totals">' + html.slice(start,end) + '</div>' + html.slice(end))
    .replace("</head>", `${style}</head>`);
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
};
