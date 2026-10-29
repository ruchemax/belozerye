const links = [
  ["belozersky-1544", "церковь Илья Пророк", "../../churches/ilya-prophet-charoma/"],
  ["belozersky-1544", "церковь Рожество Пречистые", "../../churches/nativity-bogoroditsy-churovskaya/"],
  ["belozersky-1626", "церковь Пречистые Богородицы и Чеснаго Рожества", "../../churches/nativity-bogoroditsy-churovskaya/"]
];

export const up = (db) => {
  const select = db.prepare("SELECT html FROM book_documents WHERE book_id = ?");
  const update = db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?");
  for (const [bookId, label, href] of links) {
    const row = select.get(bookId);
    if (!row) throw new Error(`Book document ${bookId} was not found.`);
    const linked = `<a href="${href}">${label}</a>`;
    const html = row.html.includes(linked) ? row.html : row.html.replace(label, linked);
    if (!html.includes(linked)) throw new Error(`Church name ${label} was not linked in ${bookId}.`);
    update.run(html, bookId);
  }
};
