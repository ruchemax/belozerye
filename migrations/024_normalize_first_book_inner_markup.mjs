export const up = (db) => {
  db.prepare(`
    UPDATE book_documents
    SET html = replace(html, 'relative z-10 paper-inner', 'relative z-10')
    WHERE book_id = ?
  `).run("belozersky-1544");
};
