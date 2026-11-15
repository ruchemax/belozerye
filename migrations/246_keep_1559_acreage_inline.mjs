export const formatDocument = (html) => {
  let count = 0;
  const result = html.replace(
    /(<div class="record-heading-line"><h3\b[^>]*>[\s\S]*?<\/h3>)<\/div><div class="record-body"><p class="record-prose">([\s\S]*?)<\/p>/gu,
    (_match, heading, acreage) => {
      count += 1;
      return `${heading} <span class="heading-inline-prose">${acreage}</span></div><div class="record-body">`;
    }
  );
  if (count === 0 && (html.match(/<span class="heading-inline-prose">/gu) ?? []).length === 132) return html;
  if (count !== 132) throw new Error(`Expected 132 inline continuations, found ${count}.`);
  return result;
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
