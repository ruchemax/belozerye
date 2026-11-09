export const up = (db) => {
  const bookId = "belozersky-1585";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const record = /<section\b[^>]*\bid="belozersky-1585-church-ievlevo"[^>]*>[\s\S]*?<\/section>/u;
  const status = '<span class="heading-status-prose"> пуста</span>';
  if (!document || !record.test(document.html)) throw new Error("The Ievlevo record was not found.");
  const html = document.html.replace(record, (section) => {
    if (!section.includes(status)) throw new Error("The Ievlevo status text was not found.");
    return section.replace(status, '<span class="heading-status-prose"> пуста, </span>');
  });
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
