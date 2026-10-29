export const up = (db) => {
  const bookId = "belozersky-1544";
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!row) throw new Error(`Book document ${bookId} was not found.`);

  const pattern = /(<h3\b[^>]*\bid="nativity-church"[^>]*>[\s\S]*?<\/h3>\s*<p\b[^>]*\bclass="[^"]*\bclosing-church\b[^"]*"[^>]*>[\s\S]*?<\/p>)/u;
  if (!pattern.test(row.html)) {
    throw new Error("The 1544 Nativity church passage was not found.");
  }
};
