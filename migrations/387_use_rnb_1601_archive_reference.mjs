export const up = (db) => {
  const bookId = "kirillov-1601";
  const book = db.prepare("SELECT archive_reference FROM books WHERE id = ?").get(bookId);
  if (!book) throw new Error("The 1601 book was not found.");
  // Collection name: https://nlr.ru/manuscripts/RA1527/elektronnyiy-katalog
  // Manuscript number: https://www.old.archeo.ru/izdaniya-1/vagnejshije-izdanija/pdf/2003Spets_ist_dists.pdf (document 20).
  db.prepare("UPDATE books SET archive_reference = ? WHERE id = ?").run(
    "ОР РНБ. Ф. 351 (Библиотека Кирилло-Белозерского монастыря). № 70/1309. Лл. 1–157об.", bookId
  );
};
