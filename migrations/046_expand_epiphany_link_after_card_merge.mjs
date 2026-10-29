export const up = (db) => {
  const bookId = "belozersky-1585";
  const href = "../../churches/bogoyavlenie-ugol/";
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!row) throw new Error(`Book document ${bookId} was not found.`);

  const html = row.html.replace(
    new RegExp(`(<a href="${href}">церковь Богоявление<\\/a>)([\\s\\S]{0,250}?Господа нашего Иисуса Христа)`, "u"),
    `<a href="${href}">церковь Богоявление$2</a>`
  );
  if (html === row.html) throw new Error("The short Epiphany church link was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
