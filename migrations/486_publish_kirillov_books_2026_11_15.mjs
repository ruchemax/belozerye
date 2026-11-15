export const up = (db) => {
  for (const bookId of ["kirillov-1559", "kirillov-1601"]) {
    let html = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId)?.html;
    const pattern = /(<p\b[^>]*\bpublication-date[^>]*>)[\s\S]*?<\/p>/u;
    if (!html || !pattern.test(html)) throw new Error(`Missing publication date for ${bookId}.`);
    html = html.replace(pattern, '$1Опубликовано: <time datetime="2026-11-15">15 ноября 2026 г.</time></p>');
    html = html.replace(/(<meta\b[^>]*\bcontent=")2026-11-\d{2}("[^>]*\bname="date"[^>]*>)/u, '$12026-11-15$2');
    db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html, bookId);
  }
};
