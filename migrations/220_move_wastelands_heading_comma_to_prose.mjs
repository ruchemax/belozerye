export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const heading = /(<h2\b[^>]*\bid="folios-547-561-summary-old-empty-villages"[^>]*>[\s\S]*?),\s*<\/h2>(\s*<p\b[^>]*\bclass="summary-paragraph"[^>]*>)/u;
  if (!document || !heading.test(document.html)) {
    throw new Error("The wastelands heading with its terminal comma was not found.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(heading, "$1</h2>$2, "), bookId);
};
