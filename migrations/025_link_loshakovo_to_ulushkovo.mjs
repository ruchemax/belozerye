export const up = (db) => {
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1544");
  if (!row) throw new Error("Book document belozersky-1544 was not found.");

  const html = row.html
    .replaceAll('../../places/loshakovo-monastery/', '../../places/ulushkovo/')
    .replaceAll('../../places/pogost-rozhestva-bogoroditsy/', '../../places/ulushkovo/');

  if (!html.includes('href="../../places/ulushkovo/">Починок Лошаково')) {
    throw new Error("The Loshakovo heading link was not updated to Ulushkovo.");
  }

  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(html, "belozersky-1544");
};
