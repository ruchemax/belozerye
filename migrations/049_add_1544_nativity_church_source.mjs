export const up = (db) => {
  const book = db.prepare("SELECT slug, short_title FROM books WHERE id = ?").get("belozersky-1544");
  if (!book) throw new Error("Book belozersky-1544 was not found.");
  db.prepare(`
    INSERT INTO church_sources (church_id, book_slug, book_title, source_anchor)
    VALUES (?, ?, ?, ?)
  `).run(
    "nativity-bogoroditsy-churovskaya",
    book.slug,
    book.short_title,
    "nativity-church"
  );
};
