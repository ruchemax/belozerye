export const formatDocument = (html) => html.replaceAll("Приходец", "приходец");

export const up = (db) => {
  for (const document of db.prepare("SELECT book_id, html FROM book_documents WHERE instr(html, 'Приходец') > 0").all()) {
    db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
      .run(formatDocument(document.html), document.book_id);
  }
};
