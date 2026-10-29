export const up = (db) => {
  const bookId = "belozersky-1585";
  const href = "../../churches/bogoyavlenie-ugol/";
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!row) throw new Error(`Book document ${bookId} was not found.`);

  const pattern = new RegExp(
    `<a href="${href}">церковь Богоявление<\\/a>(\\s*<span\\b[^>]*\\bclass="[^"]*\\bpage-mark\\b[^"]*"[^>]*>\\(л\\. 1544об\\.\\)<\\/span>)\\s*Господа нашего Иисуса Христа`,
    "u"
  );
  const html = row.html.replace(
    pattern,
    `<a href="${href}">церковь Богоявление$1 Господа нашего Иисуса Христа</a>`
  );
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
