export const up = (db) => {
  db.prepare(`
    INSERT INTO churches (id, slug, name, book_slug, book_title, source_anchor, location_place_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "bogoyavlenie-state-churchyard",
    "bogoyavlenie-state-churchyard",
    "Богоявления Господа Бога и Спаса нашего Иисуса Христа",
    "belozersky_uezd-1626-27",
    "Писцовая книга Белозерского уезда (1626/27 г.)",
    "church-and-estates",
    null
  );

  const bookId = "belozersky-1626";
  const label = "церковь Богоявления Господа Бога и Спаса нашего Иисуса Христа";
  const href = "../../churches/bogoyavlenie-state-churchyard/";
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!row) throw new Error(`Book document ${bookId} was not found.`);
  const linked = `<a href="${href}">${label}</a>`;
  const html = row.html.includes(linked) ? row.html : row.html.replace(label, linked);
  if (!html.includes(linked)) throw new Error(`Church name ${label} was not linked in ${bookId}.`);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
