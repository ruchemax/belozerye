export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const original = "headings.forEach((heading, headingIndex) => {";
  if (!document?.html.includes(original)) {
    throw new Error("The heading toggle initializer was not found in the 1626 book.");
  }
  const corrected = `${original}\n\t\tif (heading.querySelector(":scope > .heading-toggle")) return;`;
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, corrected), bookId);
};
