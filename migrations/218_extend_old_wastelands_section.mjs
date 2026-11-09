export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626 book document was not found.");

  const oldBoundary = /<\/div>\s*<\/section>(\s*<section\b[^>]*\bid="folios-547-561-place-53"[^>]*>)/u;
  const newBoundary = /(<section\b[^>]*\bid="folios-547-561-place-56"[^>]*>[\s\S]*?<\/section>)(\s*<p\b[^>]*\bclass="summary-separator summary-paragraph"[^>]*>)/u;
  if (!oldBoundary.test(document.html) || !newBoundary.test(document.html)) {
    throw new Error("The old wastelands section boundaries were not found.");
  }
  const html = document.html
    .replace(oldBoundary, "$1")
    .replace(newBoundary, "$1</div></section>$2");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
