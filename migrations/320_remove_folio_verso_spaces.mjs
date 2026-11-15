const normalize = (value) => value.replace(/(\d[\p{L}]?)[ \t\u00a0\u202f]+(?=об\.)/gu, "$1");

export const up = (db) => {
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = normalize(document.html);
    if (html !== document.html) {
      db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
    }
  }
  for (const fragment of db.prepare("SELECT id, folio FROM fragments WHERE folio IS NOT NULL").all()) {
    const folio = normalize(fragment.folio);
    if (folio !== fragment.folio) {
      db.prepare("UPDATE fragments SET folio = ? WHERE id = ?").run(folio, fragment.id);
    }
  }
};
