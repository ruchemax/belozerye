export const formatDocument = (html) => html.replace(
  /(<section class="record place-record"[^>]*>)([\s\S]*?)(<\/section>)/gu,
  (_match, opening, body, closing) => opening + body.replace(
    /<\/p>\s*<p class="record-prose">(?=И всего (?:оброку (?:дают )?)?(?:пол-)?\d)/gu,
    " "
  ) + closing
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
