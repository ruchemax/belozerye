const links = [
  ["belozersky-1544", "церковь Кирил Белозерской Чюдотворец", "../../churches/kirill-belozersky-pishchalinskoe/"],
  ["belozersky-1585", "церковь Богоявление", "../../churches/bogoyavlenie-ugol/"],
  ["belozersky-1585", "церковь страстотерпца Христова Георгия", "../../churches/george-victorious-ugol/"],
  ["belozersky-1626", "церковь Миколы Чюдотворца", "../../churches/nicholas-chudotvorets-churovskaya/"]
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
