const updates = [
  {
    bookId: "belozersky-1544",
    previous: '<time data-astro-cid-zcak6nys="" datetime="2026-10-23">23 октября 2026 г.</time>',
    next: '<time data-astro-cid-zcak6nys="" datetime="2026-10-29">29 октября 2026 г.</time>'
  },
  {
    bookId: "belozersky-1585",
    previous: "Опубликовано: 23 октября 2026 г.",
    next: "Опубликовано: 29 октября 2026 г."
  }
];

export const up = (db) => {
  const readDocument = db.prepare("SELECT html FROM book_documents WHERE book_id = ?");
  const updateDocument = db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?");

  for (const update of updates) {
    const document = readDocument.get(update.bookId);
    if (!document?.html.includes(update.previous)) {
      throw new Error(`Не найдена исходная дата публикации в книге ${update.bookId}.`);
    }
    updateDocument.run(document.html.replace(update.previous, update.next), update.bookId);
  }
};
