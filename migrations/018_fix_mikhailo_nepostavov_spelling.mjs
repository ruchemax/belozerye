export const up = (db) => {
  db.prepare(`
    UPDATE book_documents
    SET html = replace(html, ?, ?)
    WHERE book_id = ?
  `).run(
    "Михаило Непоставов сын",
    "Михайло Непоставов сын",
    "belozersky-1626"
  );
};
