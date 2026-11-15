export const formatDocument = (html) => html.replace(
  /<p class="record-prose">\.\.\.<\/p>\s*<p class="record-prose">/gu,
  '<p class="record-prose">... '
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
