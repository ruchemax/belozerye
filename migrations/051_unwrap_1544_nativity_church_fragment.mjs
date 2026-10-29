export const up = (db) => {
  const bookId = "belozersky-1544";
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!row) throw new Error(`Book document ${bookId} was not found.`);

  const pattern = /<section class="record church-source-fragment" id="belozersky-1544-nativity-church">([\s\S]*?)<\/section>/u;
  if (!pattern.test(row.html)) return;
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(row.html.replace(pattern, "$1"), bookId);
};
